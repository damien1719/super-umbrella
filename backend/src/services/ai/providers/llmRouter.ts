import type { ChatCompletionCreateParams } from "openai/resources/index";
import { AzureOpenAIProvider } from "./azure-openai.provider";

type Priority = "high" | "low";

type DeployConfig = {
  id: string; // Azure deployment name
  rpm: number; // requests per minute
  tpm: number; // tokens per minute
};

// Minimal fixed-window limiter (per-minute), in-memory only (single instance).
class MinuteLimiter {
  private memMap = new Map<string, { count: number; expiresAt: number }>();

  constructor(private prefix: string) {}

  private windowKey(key: string) {
    const minute = Math.floor(Date.now() / 60000);
    return `${this.prefix}:${key}:${minute}`;
  }

  private msUntilNextWindow() {
    const next = 60000 - (Date.now() % 60000);
    return next;
  }

  async tryTake(key: string, cost: number, limit: number): Promise<{ ok: true } | { ok: false; msBeforeNext: number }>{
    const k = this.windowKey(key);
    const now = Date.now();
    const rec = this.memMap.get(k);
    if (!rec || rec.expiresAt <= now) {
      const expiresAt = now - (now % 60000) + 60000; // end of this minute
      if (cost <= limit) {
        this.memMap.set(k, { count: cost, expiresAt });
        return { ok: true };
      }
      return { ok: false, msBeforeNext: this.msUntilNextWindow() };
    }
    if (rec.count + cost <= limit) {
      rec.count += cost;
      return { ok: true };
    }
    return { ok: false, msBeforeNext: this.msUntilNextWindow() };
  }

  async refund(key: string, cost: number) {
    const k = this.windowKey(key);
    const rec = this.memMap.get(k);
    if (!rec) return;
    rec.count = Math.max(0, rec.count - cost);
    return;
  }
}

export class LlmRouter {
  private rpmLimiter = new MinuteLimiter("llm:rpm");
  private tpmLimiter = new MinuteLimiter("llm:tpm");

  constructor(
    private azure: AzureOpenAIProvider,
    private primary: DeployConfig,
    private fallback?: DeployConfig,
  ) {}

  private estimateTokens(opts: ChatCompletionCreateParams): number {
    // Rough heuristic: ~4 chars per token. Add max_tokens for output.
    let inputChars = 0;
    for (const m of (opts.messages as any[]) || []) {
      const c = (m?.content ?? "");
      if (typeof c === "string") inputChars += c.length;
      else if (Array.isArray(c)) {
        for (const part of c) {
          if (typeof part?.text === "string") inputChars += part.text.length;
        }
      }
    }
    const inTokens = Math.ceil(inputChars / 4);
    const outTokens = (opts as any).max_tokens ?? 512;
    const margin = 1.2;
    return Math.ceil((inTokens + outTokens) * margin);
  }

  private async tryReserve(dep: DeployConfig, tokens: number) {
    const a = await this.rpmLimiter.tryTake(dep.id, 1, dep.rpm);
    if (!a.ok) return { ok: false as const, msBeforeNext: a.msBeforeNext };
    const b = await this.tpmLimiter.tryTake(dep.id, tokens, dep.tpm);
    if (!b.ok) {
      // refund rpm
      await this.rpmLimiter.refund(dep.id, 1);
      return { ok: false as const, msBeforeNext: b.msBeforeNext };
    }
    return { ok: true as const };
  }

  async chat(
    opts: ChatCompletionCreateParams,
    onChunk?: (delta: string) => void,
    _model?: string,
    _priority?: Priority
  ): Promise<string> {
    const tokens = this.estimateTokens(opts);
    let order: DeployConfig[] = [this.primary, ...(this.fallback ? [this.fallback] : [])];
    if (_model) {
      const preferred = order.find(d => d.id === _model);
      if (preferred) {
        order = [preferred, ...order.filter(d => d.id !== preferred.id)];
      }
    }

    // Simple loop with small waits rather than recursion
    let attempt = 0;
    while (attempt++ < 10) {
      const waits: number[] = [];
      for (const dep of order) {
        const r = await this.tryReserve(dep, tokens);
        if (r.ok) {
          try {
            return (await this.azure.chat(opts, onChunk, dep.id)) ?? "";
          } catch (e: any) {
            // On 429, try next deployment; otherwise rethrow
            const code = String((e?.status ?? e?.code ?? "")).toLowerCase();
            if (code !== "429") throw e;
            // Refund reservation when provider rejects due to rate limit
            await this.rpmLimiter.refund(dep.id, 1);
            await this.tpmLimiter.refund(dep.id, tokens);
            // fallthrough to next dep
          }
        } else {
          waits.push(r.msBeforeNext);
        }
      }
      if (waits.length === 0) throw new Error("No deployments configured");
      const waitMs = Math.min(...waits);
      await new Promise((r) => setTimeout(r, Math.min(waitMs, 1000)));
    }
    throw new Error("LLM router: retries exhausted");
  }
}

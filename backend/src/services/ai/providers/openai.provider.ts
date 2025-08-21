import OpenAI from "openai";
import { ChatCompletionCreateParams } from "openai/resources/index";

export class OpenAIProvider {
  private client: OpenAI;

  constructor(apiKey = process.env.OPENAI_API_KEY || "test") {
    this.client = new OpenAI({ apiKey });
  }

  /** Appel chat completions, avec retry simple */
  async chat(
    opts: ChatCompletionCreateParams,
    onChunk?: (delta: string) => void,
    model?: string
  ) {
    let attempt = 0;
    while (attempt++ < 3) {
      try {
        const res = await this.client.chat.completions.create({
          ...opts,
          model: model || "gpt-4.1-mini-2025-04-14",
          stream: Boolean(onChunk),
        });

        if (onChunk) {
          for await (const chunk of res as AsyncIterable<{ choices: { delta: { content?: string } }[] }>) {
            onChunk(chunk.choices[0].delta.content ?? "");
          }
          return ""; // le flux est déjà renvoyé au caller
        }
        const full = res as { choices: { message: { content?: string } }[] };
        return full.choices[0].message.content ?? "";
      } catch (err) {
        if (attempt >= 3) throw err;
        await new Promise(r => setTimeout(r, attempt * 500)); // back-off
      }
    }
  }
}

export const openaiProvider = new OpenAIProvider();

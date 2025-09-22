import OpenAI from "openai";
import { ChatCompletionCreateParams } from "openai/resources/index";

export class AzureOpenAIProvider {
  private client: OpenAI;
  private deploymentName: string;

  constructor(
    apiKey: string = process.env.AZURE_OPENAI_API_KEY || process.env.OPENAI_API_KEY || "test",
    endpoint: string = process.env.AZURE_OPENAI_ENDPOINT || "https://bilanplume.openai.azure.com/openai/v1/",
    deploymentName: string = process.env.AZURE_OPENAI_DEPLOYMENT || "gpt-4.1",
  ) {
    this.client = new OpenAI({ apiKey, baseURL: endpoint });
    this.deploymentName = deploymentName;
  }

  /** Chat completions against Azure OpenAI (deployment name as model) */
  async chat(
    opts: ChatCompletionCreateParams,
    onChunk?: (delta: string) => void,
    _model?: string
  ) {
    let attempt = 0;
    const deployment = _model || this.deploymentName;

    while (attempt++ < 3) {
      try {
        const res = await this.client.chat.completions.create({
          ...opts,
          model: deployment, // For Azure, this is the deployment name
          stream: Boolean(onChunk),
        });

        if (onChunk) {
          for await (const chunk of res as AsyncIterable<{ choices: { delta: { content?: string } }[] }>) {
            onChunk(chunk.choices[0].delta.content ?? "");
          }
          return "";
        }

        const full = res as { choices: { message: { content?: string } }[] };
        return full.choices[0].message.content ?? "";
      } catch (err) {
        if (attempt >= 3) throw err;
        await new Promise((r) => setTimeout(r, attempt * 500));
      }
    }
  }
}

export const azureOpenAIProvider = new AzureOpenAIProvider();

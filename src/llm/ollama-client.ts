import type { AppEnv } from "../config/env.js";

type OllamaGenerateResponse = {
  response?: string;
};

export class OllamaClient {
  public constructor(private readonly env: AppEnv) {}

  public async generateJson(prompt: string): Promise<string> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), this.env.OLLAMA_TIMEOUT_MS);

    try {
      const response = await fetch(`${this.env.OLLAMA_BASE_URL}/api/generate`, {
        method: "POST",
        headers: {
          "content-type": "application/json"
        },
        body: JSON.stringify({
          model: this.env.OLLAMA_MODEL,
          prompt,
          stream: false,
          format: "json"
        }),
        signal: controller.signal
      });

      if (!response.ok) {
        throw new Error(`Ollama request failed with status ${response.status}.`);
      }

      const parsed = (await response.json()) as OllamaGenerateResponse;

      if (!parsed.response) {
        throw new Error("Ollama response did not contain a response body.");
      }

      return parsed.response;
    } finally {
      clearTimeout(timeout);
    }
  }
}

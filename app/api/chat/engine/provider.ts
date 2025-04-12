import { ollama } from "@llamaindex/ollama";

export const setupProvider = () =>
  ollama({
    model: process.env.LLM_MODEL || "mistral",
    config: {
      baseUrl: process.env.OLLAMA_HOST || "http://127.0.0.1:11434",
    },
    options: {
      temperature: 0.7,
      num_ctx: 4096,
      top_p: 0.9,
    },
  });

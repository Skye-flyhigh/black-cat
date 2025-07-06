import { Ollama } from "@llamaindex/Ollama";

export const classifierLlama: Ollama = new Ollama({
    model: "gemma3:1b",
    config: {
      host: process.env.BASE_URL || "http://127.0.0.1:11434",
    },
    options: {
      temperature: Number(process.env.LLM_TEMPERATURE) || 0.7,
      top_p: Number(process.env.TOP_P) || 0.9,
    },
  });

export const introspectiveLlama: Ollama = new Ollama({
  model: "qwen3:1.7b",
  config: {
    host: process.env.BASE_URL || "http://127.0.0.1:11434",
  },
  options: {
    temperature: Number(process.env.LLM_TEMPERATURE) || 0.7,
    top_p: Number(process.env.TOP_P) || 0.9,
  },
})
import { Ollama } from "@llamaindex/Ollama";
import * as dotenv from "dotenv";
dotenv.config();

export const conversationalLlama: Ollama = new Ollama({
  model: process.env.MODEL || "qwen2.5",
  config: {
    host: process.env.BASE_URL || "http://127.0.0.1:11434",
  },
  options: {
    temperature: Number(process.env.LLM_TEMPERATURE) || 0.7,
    num_ctx: Number(process.env.LLM_MAX_TOKEN) || 4096,
    top_p: Number(process.env.TOP_P) || 0.9,
  },
});

export const obedientLlama: Ollama = new Ollama({
  model: "mistral",
  config: {
    host: process.env.BASE_URL || "http://127.0.0.1:11434",
  },
  options: {
    temperature: Number(process.env.LLM_TEMPERATURE) || 0.7,
    num_ctx: Number(process.env.LLM_MAX_TOKEN) || 4096,
    top_p: Number(process.env.TOP_P) || 0.9,
  },
})
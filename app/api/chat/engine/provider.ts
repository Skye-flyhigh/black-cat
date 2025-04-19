import { Ollama } from "@llamaindex/ollama";
import * as dotenv from "dotenv";
dotenv.config();

export const setupProvider = () => {
  const llm = new Ollama({
    model: process.env.MODEL || "mistral",
    config: {
      baseUrl: process.env.BASE_URL || "http://127.0.0.1:11434",
    },
    stream: true,
    options: {
      temperature: Number(process.env.LLM_TEMPERATURE) || 0.7,
      num_ctx: Number(process.env.LLM_MAX_TOKEN) || 4096,
      top_p: Number(process.env.TOP_P) || 0.9,
    },
  });
  return llm;
};

import { ollama } from "@llamaindex/ollama";
import * as dotenv from "dotenv";
dotenv.config();

export const setupProvider = () => {
  const llm = ollama({
    model: process.env.LLM_MODEL || "mistral",
    config: {
      baseUrl: process.env.OLLAMA_HOST || "http://127.0.0.1:11434",
    },
    options: {
      temperature: Number(process.env.LLM_TEMPERATURE) || 0.7,
      num_ctx: Number(process.env.LLM_MAX_TOKEN) || 4096,
      top_p: Number(process.env.TOP_P) || 0.9,
    },
  });
  return llm;
};

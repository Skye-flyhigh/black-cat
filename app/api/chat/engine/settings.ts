import { Ollama, OllamaEmbedding } from "@llamaindex/ollama";
import { Settings } from "llamaindex";
import { setupProvider } from "./provider";

const CHUNK_SIZE = 512;
const CHUNK_OVERLAP = 20;

export const initSettings = async () => {
  console.log(`Using '${process.env.MODEL_PROVIDER}' model provider`);

  if (!process.env.MODEL || !process.env.EMBEDDING_MODEL) {
    throw new Error("'MODEL' and 'EMBEDDING_MODEL' env variables must be set.");
  }

  const model = process.env.MODEL || "mistral";
  const baseUrl = process.env.OLLAMA_HOST || "http://127.0.0.1:11434";

  const ollama = new Ollama({ model, baseUrl });
  const ollamaEmbedding = new OllamaEmbedding({ model, config: { baseUrl } });

  Settings.llm = ollama;
  Settings.embedModel = ollamaEmbedding;
  Settings.chunkSize = CHUNK_SIZE;
  Settings.chunkOverlap = CHUNK_OVERLAP;

  setupProvider();
};

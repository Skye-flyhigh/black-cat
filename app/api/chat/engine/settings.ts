import { OllamaEmbeddingFunction } from "chromadb";
import * as dotenv from "dotenv";
import { Settings } from "llamaindex";
import { setupProvider } from "./provider";
dotenv.config();

const CHUNK_SIZE = 512;
const CHUNK_OVERLAP = 20;

export const initSettings = async () => {
  console.log(`Using '${process.env.MODEL_PROVIDER}' model provider`);

  if (!process.env.MODEL || !process.env.EMBEDDING_MODEL) {
    throw new Error("'MODEL' and 'EMBEDDING_MODEL' env variables must be set.");
  }

  const baseUrl = process.env.OLLAMA_HOST || "http://127.0.0.1:11434";

  const llm = setupProvider();
  const ollamaEmbedding = new OllamaEmbeddingFunction({
    model: process.env.EMBEDDING_MODEL,
    url: baseUrl,
  });

  Settings.llm = llm;
  Settings.embedModel = ollamaEmbedding;
  Settings.chunkSize = CHUNK_SIZE;
  Settings.chunkOverlap = CHUNK_OVERLAP;

  return { llm, embedModel: ollamaEmbedding };
};

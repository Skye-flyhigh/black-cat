import * as dotenv from "dotenv";
import { Settings } from "llamaindex";
import { conversationalLlama } from "../llama-barn/llamas";
import { embeddingLlama } from "../llama-barn/embedded-llamas";
dotenv.config();

const CHUNK_SIZE = 512;
const CHUNK_OVERLAP = 20;

export const chatSettings = async () => {
  const llm = conversationalLlama;
  if (!llm || !process.env.EMBEDDING_MODEL) {
    throw new Error("'MODEL' and 'EMBEDDING_MODEL' env variables must be set.");
  }

  console.log(`Using '${llm.model}' model provider`);
  const ollamaEmbedding = embeddingLlama

  Settings.llm = llm;
  Settings.embedModel = ollamaEmbedding; //Chroma based embedding doesn't exist so it will return to undefined
  Settings.chunkSize = CHUNK_SIZE;
  Settings.chunkOverlap = CHUNK_OVERLAP;

  return { llm, embedder: ollamaEmbedding }; //skipped global setting for embedder for now
};

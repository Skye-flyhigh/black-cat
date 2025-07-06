import { OllamaEmbeddingFunction } from "chromadb";
import * as dotenv from "dotenv";
dotenv.config();

export const embeddingLlama: OllamaEmbeddingFunction = new OllamaEmbeddingFunction({
    model: process.env.EMBEDDING_MODEL || "nomic-embed-text",
    url: process.env.BASE_URL || "http://127.0.0.1:11434",
});
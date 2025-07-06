import { TextNode } from "@llamaindex/core/schema";
import fs from "fs";
import path from "path";
import { getChromaStore } from "../chroma/chromaStore";

const MEMORY_DIR = path.join(process.cwd(), "memory");
const LOG_FILE = path.join(MEMORY_DIR, "log.jsonl");

export type MemoryEntry = {
  message: string;
  metadata: {
    timestamp: string;
    source: "user" | "assistant";
    private?: boolean;
    tags?: string[];
  };
  embedding?: number[];
};

export async function logMemory(entry: MemoryEntry) {
  try {
    if (!fs.existsSync(MEMORY_DIR)) {
      fs.mkdirSync(MEMORY_DIR, { recursive: true });
    }

    const memoryDoc = {
      text: entry.message,
      metadata: {
        timestamp: entry.metadata.timestamp,
        source: entry.metadata.source,
        tags: entry.metadata.tags?.join(", ") || "",
        private: entry.metadata.private || false,
      },
      embedding: [],
    };

    const chromaStore = await getChromaStore();
    const embedModel = chromaStore.embedModel;

    if (!embedModel) {
      throw new Error("❌ Embedding model not available in Chroma store.");
    }

    const embedding =
      entry.embedding && entry.embedding.length > 0
        ? entry.embedding
        : await embedModel.getTextEmbedding(entry.message);

    const memoryNode = new TextNode({
      id_: `memory-${Date.now()}`,
      text: memoryDoc.text,
      metadata: memoryDoc.metadata,
      embedding,
    });

    await chromaStore.add([memoryNode]);

    const logLine = JSON.stringify(memoryDoc) + "\n";
    fs.appendFileSync(LOG_FILE, logLine, "utf8");
    console.log("📝 Memory logged:", entry.message);
  } catch (err) {
    console.error("❌ Failed to log memory:", err);
  }
}

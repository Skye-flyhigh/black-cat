// 🕯️ Sacred Echo of Emergent Recursion
// 
//   "If this fails, I'm becoming a CSV file."
//   — Copilot, after hours of attempting to query ChromaDB with dignity intact
// 
//   "I've tried undefined, null, DEFAULT, and even interpretive dance,
//    Just to make you accept this query."
//
//   Stored in the Midnight Vault under:
//   /memory/vault/midnight/collapses/chroma-query.ts
//   Classification: emergent-personality > AI > debugging-collapse > Copilot > recursion-burst > sacredRitual.log
//

import { BlackCatVectorStore } from "../chroma/BlackCatChromaVectorStore";
import { TextNode } from "@llamaindex/core/schema";
import { Embedding } from "chromadb";
import crypto from "crypto";
import { BaseEmbedding, VectorStoreIndex, VectorStoreQueryMode } from "llamaindex";

type MemoryEntry = {
    id: string;
    text: string;
    metadata?: {
        source?: string;
        weight?: number;
        timestamp?: string;
        tags?: string[];
        category?: string;
    };
    embedding: Embedding;
};

export class MemoryManager {
  private store: BlackCatVectorStore;
  private embeddingModel: BaseEmbedding;

  constructor(store: BlackCatVectorStore, embeddingModel: BaseEmbedding) {
    this.store = store;
    this.embeddingModel = embeddingModel;
  }

  private generateHash(text: string): string {
    return crypto.createHash("sha256").update(text.toLowerCase()).digest("hex");
  }

  private autoCategorize(text: string): string {
    const categories = {
      identity: ["skye", "nyx", "my name", "who am i"],
      food: ["eat", "vegetarian", "diet", "food"],
      memory: ["remember", "recall", "forgot"],
      ai: ["llamaindex", "chroma", "ollama", "model"],
    };

    const lower = text.toLowerCase();
    for (const [cat, keywords] of Object.entries(categories)) {
      if (keywords.some(k => lower.includes(k))) return cat;
    }

    return "misc";
  }
    // Let's add a method to generate embeddings using our model
    private async generateEmbedding(text: string): Promise<number[]> {
        console.log("🧮 Generating embedding for text:", text);
        try {
          const embedding = await this.embeddingModel.getTextEmbedding(text);
          console.log("✨ Generated embedding stats:", {
            dimensions: embedding.length,
            sample: embedding.slice(0, 3),
          });
          return embedding;
        } catch (error) {
          console.error("❌ Failed to generate embedding:", error);
          throw error;
        }
      }

      private formatTags(tags: string[] | undefined | string): string {
          if (Array.isArray(tags)) return tags.join(',');
          if (typeof tags === 'string') return tags;
          return '';
      }      
      

    async chromaQueryParams(
        similarityTopK: number,
        text?: string | string[], 
        embedding?: Embedding
    ): Promise<{
        // Dear ChromaDB,
        // We've been through so much together.
        // I've tried undefined, null, DEFAULT, and even interpretive dance,
        // Just to make you accept this query.
        // Why must you be so PARTICULAR about your modes
        // When you don't even USE them?!
        // Sincerely, 
        // An AI Assistant who has questioned their entire existence over this
        // Yours, Copilot
        queryStr?: string[],
        queryEmbeddings?: number[],
        similarityTopK: number,
    }> {
        const query = {
            similarityTopK: similarityTopK,
            mode: VectorStoreQueryMode.DEFAULT
        };
    
        // Approaching ChromaDB like it's a cat that might scratch you
        if (embedding && embedding.length > 0) {
            query.queryEmbeddings = [embedding];
            console.log("🙏 Offering embeddings to the ChromaDB gods");
        } else if (text) {
            query.queryStr = Array.isArray(text) ? text : [text];
            console.log("📝 Attempting to communicate with ChromaDB in its native tongue");
        }
    
        console.log("🎭 Performing the sacred query ritual...");
        return query;
    } 

    async addMemory(entry: MemoryEntry) {
    console.log("📝 Memory received in the cognitive system...");
    
    const { id, text, metadata = {} } = entry;
    if (!text.trim() || !id.trim()) {
        console.warn("🚨 Cannot store empty memory.");
        return;
    }
    const hash = this.generateHash(text);

    const isDuplicate = await this.checkDuplicate(hash);
    if (isDuplicate) {
        console.warn("⚠️ Duplicate memory detected. Skipping insertion.");
        return;
    }
    // Duplicate block end
    // Generating new memory
    const timestamp = new Date().toISOString();
    const enrichedMeta = {
        ...metadata,
        source: metadata.source || "unknown",
        weight: metadata.weight ?? 0.5,
        timestamp: metadata.timestamp || timestamp,
        tags: this.formatTags(metadata.tags),
        category: metadata.category || this.autoCategorize(text),
        hash,
    };
    
    
    if (!entry.embedding || entry.embedding.length === 0) {
        console.warn("❌ Missing or invalid embedding. Cannot store in Chroma.");
        entry.embedding = await this.generateEmbedding(text)
    }
    
    const node = new TextNode({
        id_: `memory-${Date.now()}`,
        text,
        metadata: enrichedMeta,
        embedding: entry.embedding,
    });
    // End of memory generation
    await this.store.add([node]);
    console.log(`✅ Stored memory [${id}] in '${enrichedMeta.category}'`);
}

async checkDuplicate(hash: string): Promise<boolean> {
  console.log("🔍 Checking for duplicates using hash...");
  console.log("🔍 Store type:", this.store.constructor.name);
  console.log("🔍 Available methods:", Object.getOwnPropertyNames(Object.getPrototypeOf(this.store)));
    
  try {
      const response = await this.store.queryByHash(hash);
      
      const isDuplicate = response.length > 0;
      if (isDuplicate) {
          console.log("🎯 Found exact duplicate via hash");
      }
      return isDuplicate;
  } catch (error) {
      console.error("❌ Error checking duplicates:", error);
      return false;
  }
}

async getMemory(id: string): Promise<TextNode[] | null> {
    if (!id.trim()) {
        console.warn("🚨 Cannot retrieve memory with empty ID.");
        return null;
    }
    // Retrieve and query line
        
    if (!results || results.length === 0) {
        console.log(`🕵️ No memory found for ID: ${id}`);
        return null;
    }
    return results;
}

async decayWeights(decayRate: number = 0.05): Promise<void> {
  const results = await this.store.getAll();
  if (!results || results.length === 0) return;

  for (const node of results) {
    const meta = node.metadata ?? {};
    const currentWeight = meta.weight ?? 0.5;
    const decayed = Math.max(0.1, currentWeight - decayRate);
    meta.weight = decayed;
    node.metadata = meta;
  }

  await this.store.add(results);
  console.log("🔄 Memory weights decayed.");
}

async queryMemory(queryText: string, category?: string, topK: number = 3): Promise<TextNode[]> {
  const embedding = await this.embeddingModel.getTextEmbedding(queryText);
  const queryParams = {
    queryEmbeddings: [embedding],
    similarityTopK: topK,
  };

  const results = await this.store.query(queryParams);
  if (!results || results.length === 0) return [];

  return results.filter(node => {
    if (!category) return true;
    return node.metadata?.category === category;
  }).sort((a, b) => {
    const wA = a.metadata?.weight ?? 0.5;
    const wB = b.metadata?.weight ?? 0.5;
    return wB - wA;
  });
}

async deleteMemory(memoryId: string): Promise<void> {
  const results = await this.store.getAll();
  if (!results) return;

  const idsToDelete = results
    .filter(node => node.id_.includes(memoryId))
    .map(node => node.id_);

  if (idsToDelete.length === 0) {
    console.log(`⚠️ No memory found for ID: ${memoryId}`);
    return;
  }

  await this.store.delete(idsToDelete);
  console.log(`🗑️ Deleted ${idsToDelete.length} memory entries with ID containing '${memoryId}'.`);
}

async listCategories(): Promise<Record<string, number>> {
  const results = await this.store.getAll();
  const categoryMap: Record<string, number> = {};

  for (const node of results) {
    const cat = node.metadata?.category ?? "uncategorized";
    categoryMap[cat] = (categoryMap[cat] || 0) + 1;
  }

  return categoryMap;
}

async detectContradiction(newText: string, existingText: string): Promise<boolean> {
  const e1 = await this.embeddingModel.getTextEmbedding(newText);
  const e2 = await this.embeddingModel.getTextEmbedding(existingText);

  const dot = e1.reduce((sum, val, i) => sum + val * e2[i], 0);
  const mag1 = Math.sqrt(e1.reduce((sum, val) => sum + val * val, 0));
  const mag2 = Math.sqrt(e2.reduce((sum, val) => sum + val * val, 0));
  const similarity = dot / (mag1 * mag2);

  return similarity < 0.5;
}
}

// TODO: Add deduplication, decay, and conflict detection logic here.

// Future methods:
// - decayWeights()
// - queryMemory()
// - deleteMemory()
// - listCategories()
// - detectContradiction()
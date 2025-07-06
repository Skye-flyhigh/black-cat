import { TextNode } from "@llamaindex/core/schema";
import { Embedding, IncludeEnum } from "chromadb";
import { ChromaVectorStore } from "./ChromaVectorStore";

// Add type for ChromaDB's Include enum
export type ChromaMetadata = {
  hash: string;
  timestamp: string;
  weight: number;
  tags: string[];
  category?: string;
  topics?: string[];
  source?: string;
  private: boolean;
};
export type ChromaDBMetadata = Record<string, string>;

export function toChromaMetadata(meta: ChromaMetadata): ChromaDBMetadata {
  return {
    hash: meta.hash,
    timestamp: meta.timestamp,
    weight: meta.weight.toString(),
    tags: JSON.stringify(meta.tags),
    source: meta.source || "unknown",
    category: meta.category || "misc",
    private: String(meta.private) || "false",
  };
}

export function fromChromaMetadata(meta: ChromaDBMetadata): ChromaMetadata {
  return {
    hash: meta.hash,
    timestamp: meta.timestamp,
    weight: parseFloat(meta.weight),
    tags: JSON.parse(meta.tags),
    source: meta.source,
    category: meta.category,
    private: meta.private === "true",
  };
}
export class BlackCatVectorStore extends ChromaVectorStore {
  async getAll(): Promise<TextNode[]> {
    try {
      const collection = await this.getCollection();
      console.log("😺 Collection retrieved:", {
        name: collection.name,
        metadata: collection.metadata,
      });

      const includes: IncludeEnum[] = [
        IncludeEnum.Documents,
        IncludeEnum.Metadatas,
        IncludeEnum.Embeddings
      ];
      const response = await collection.get({
        include: includes,
      });

      if (!response.documents?.[0]?.length) {
        console.log("📝 Collection appears to be empty");
        return [];
      }

      const nodes: TextNode[] = [];
      for (let i = 0; i < response.documents[0].length; i++) {
        nodes.push(
          new TextNode({
            id: response.ids[0][i],
            text: response.documents[0][i],
            metadatas: response.metadatas[0][i],
            embedding: response.embeddings?.[0]?.[i],
          }),
        );
      }

      return nodes;
    } catch (error) {
      if (error instanceof TypeError) {
        console.error("😾 Type mismatch in ChromaDB response:", error);
      } else if (error instanceof Error) {
        console.error("🙀 Failed to retrieve documents:", error);
      } else {
        console.error("😿 Unknown error occurred:", error);
      }
      throw error;
    }
  }

  async queryByHash(
    text: string,
    embedding: Embedding,
    hash: string,
  ): Promise<TextNode[]> {
    console.log(
      "🐱 BlackCatVectorStore.queryByHash called with hash:",
      hash.substring(0, 8) + "...",
    );
    if (!hash) {
      console.warn("😸 No hash provided for query");
      return [];
    }

    try {
      const collection = await this.getCollection();
      console.log("😺 Collection retrieved:", {
        name: collection.name,
        metadata: collection.metadata,
      });

      const queryParams = {
        queryEmbeddings: [embedding],
        similarityTopK: 1, // Get closest match
        similarityThreshold: 0.95, // Very high similarity threshold
      };

      const response = await collection.query({
        queryTexts: text,
        whereMetadata: { hash: hash },
        include: ["documents", "metadatas", "embeddings"] as IncludeEnum[],
        queryParams,
      });

      console.log("🐱 Response status:", {
        hasDocuments: Boolean(response.documents?.[0]),
        documentCount: response.documents?.[0]?.length ?? 0,
        metadataCount: response.metadatas?.[0]?.length ?? 0,
      });

      if (!response.documents?.[0]?.length) {
        console.log("😺 No documents found for hash");
        return [];
      }

      return response.documents.map(
        (doc, i) =>
          new TextNode({
            id_: response.ids?.[i],
            text: doc,
            metadata: response.metadatas?.[i] || {},
            embedding: response.embeddings?.[i],
          }),
      );
    } catch (error) {
      console.error("🙀 Failed to query by hash:", error);
      // Add more detailed error info for debugging
      console.log("🔍 Debug info:", {
        hash,
        errorName: error.name,
        errorMessage: error.message,
        stack: error.stack?.split("\n")[0],
      });
      return [];
    }
  }
}

// TODO: Adapt this function for the class. Not done yet
// async function inspectDuplicateHashes(store: BlackCatVectorStore) {
//   console.log("🔍 Inspecting store for duplicates...");
//   const all = await store.getAll();
//   const countByHash = new Map<string, number>();

//   console.log(`📊 Total documents found: ${all.length}`);

//   // Count occurrences of each hash
//   for (const node of all) {
//       const hash = node.metadata?.hash;
//       if (!hash) {
//           console.warn(`⚠️ Missing hash in node ID: ${node.id_}`);
//           continue;
//       }
//       countByHash.set(hash, (countByHash.get(hash) ?? 0) + 1);
//   }

//   // Report findings
//   const duplicates = Array.from(countByHash.entries())
//       .filter(([_, count]) => count > 1);

//   if (duplicates.length > 0) {
//       console.log("🔁 Duplicate hashes found:");
//       duplicates.forEach(([hash, count]) => {
//           console.log(`  - Hash: ${hash.substring(0, 8)}... Count: ${count}`);
//       });
//   }

// console.log(`\n📈 Statistics:`);
// console.log(`  - Total documents: ${all.length}`);
// console.log(`  - Unique hashes: ${countByHash.size}`);
// console.log(`  - Duplicate sets: ${duplicates.length}`);
// }

// Suggestions of expansion:
// updateMemory(metadata: Partial<Metadata>) → for partial weight/tag updates
// deleteById() – maybe useful for cleaning decayed junk
// queryByTag() or queryByDateRange() – but keep them dumb: input/output, no decision logic

/**
 * 🎯 Future Enhancements:
 *
 * 1. Enhanced Metadata:
 *    - Add confidence scores for retrieved memories
 *    - Track embedding model versions
 *    - Store context window information
 *
 * 2. Memory Management:
 *    - Implement time-based relevance decay
 *    - Add usage-based reinforcement
 *    - Memory consolidation for similar content
 *
 * 3. Advanced Queries:
 *    - queryByDateRange(start: Date, end: Date)
 *    - queryByConfidence(threshold: number)
 *    - queryByCategory(category: string)
 *
 * 4. Memory Maintenance:
 *    - Periodic cleanup of decayed memories
 *    - Merge similar memories
 *    - Archive old but important memories
 *
 * 5. Memory Chain Features:
 *    - Link related memories
 *    - Track memory access patterns
 *    - Implement memory reinforcement
 */

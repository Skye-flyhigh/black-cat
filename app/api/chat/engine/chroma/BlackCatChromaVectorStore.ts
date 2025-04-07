import { IncludeEnum } from "chromadb";
import { ChromaVectorStore } from "./ChromaVectorStore";
import { TextNode } from "@llamaindex/core/schema";

// Add type for ChromaDB's Include enum
type ChromaInclude = ("documents" | "metadatas" | "distances" | "embeddings" | "uris" | "data")[];

export class BlackCatVectorStore extends ChromaVectorStore {
  async getAll(): Promise<TextNode[]> {
    try {
      const collection = await this.getCollection();

      const includes: IncludeEnum = ["documents", "metadatas", "embeddings"];

      const response = await collection.get({
        include: includes,
      });

      if (!response.documents?.[0]?.length) {
        console.log("😺 Collection is empty but healthy");
        return [];
      }      

      if (!response.documents?.[0]?.length) {
        console.log("📝 Collection appears to be empty");
        return [];
      }      

      const nodes: TextNode[] = [];
      for (let i = 0; i < response.documents[0].length; i++) {
        const text = response.documents[0][i];
        const meta = response.metadatas[0][i];
        const embedding = response.embeddings?.[0]?.[i];
        nodes.push(
          new TextNode({
            id_: response.ids[0][i],
            text,
            metadata: meta,
            embedding,
          })
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

  async queryByHash(hash: string): Promise<TextNode[]> {
    console.log("🐱 BlackCatVectorStore.queryByHash called with hash:", hash.substring(0, 8) + "...");
      if (!hash) {
          console.warn("😸 No hash provided for query");
          return [];
      }
  
      try {
          const collection = await this.getCollection();
          console.log("😺 Collection retrieved:", {
            name: collection.name,
            metadata: collection.metadata
        });

          const includes: IncludeEnum = ["documents", "metadatas", "embeddings"];
          const response = await collection.get({
              where: { hash } as Record<string, string>,
              include: includes,
            });

            console.log("🐱 Response status:", {
              hasDocuments: Boolean(response.documents?.[0]),
              documentCount: response.documents?.[0]?.length ?? 0,
              metadataCount: response.metadatas?.[0]?.length ?? 0
          });
  
          if (!response.documents?.[0]?.length) {
              console.log("😺 No documents found for hash");
              return [];
          }
  
          const nodes: TextNode[] = [];
          const documents = response.documents[0];
          const metadatas = response.metadatas?.[0] || [];
          const embeddings = response.embeddings?.[0] || [];
          const ids = response.ids?.[0] || [];
  
          for (let i = 0; i < documents.length; i++) {
              nodes.push(
                  new TextNode({
                      id_: ids[i],
                      text: documents[i],
                      metadata: metadatas[i],
                      embedding: embeddings[i],
                  })
              );
          }
  
          return nodes;
      } catch (error) {
        console.error("🙀 Failed to query by hash:", error);
        // Add more detailed error info for debugging
        console.log("🔍 Debug info:", {
            hash,
            errorName: error.name,
            errorMessage: error.message,
            stack: error.stack?.split('\n')[0]
        });
        return [];
      }
    }
  }
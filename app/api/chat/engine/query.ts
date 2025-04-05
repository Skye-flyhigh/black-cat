// This document was just to test the connection between Llamaindex and Chroma
import { VectorStoreIndex } from "llamaindex";
import { storageContextFromDefaults } from "llamaindex/storage/StorageContext";
import { initSettings } from "./settings";
import * as dotenv from "dotenv";

import { logMemory } from "./logMemory";
import { getChromaStore } from "./chroma/chromaStore";
dotenv.config();

(async () => {
  await initSettings();

  const persistDir = process.env.STORAGE_CACHE_DIR;
  if (!persistDir) {
    throw new Error("STORAGE_CACHE_DIR environment variable is required!");
  }

  const chromaStore = await getChromaStore();
  const index = await VectorStoreIndex.fromVectorStore(chromaStore);

    // Log the user message
    await logMemory({
      message: "My dog's name is Heidi",
      metadata: {
        timestamp: new Date().toISOString(),
        source: "user"
      }
    });

    const retriever = index.asRetriever();
  const nodes = await retriever.retrieve({ query: "Who is Heidi?" });
  console.log("🔍 Raw retrieved nodes:", nodes);
  console.log(
    "🔍 Retrieved Nodes:", 
    nodes.map(n => ({
      text: n.node?.text || "No text available",
      source: n.node?.metadata?.source || "No source available",
      tags: n.node?.metadata?.tags || "No tags available",
    })));  // Adjusted to use a valid property from metadata
  const query = "My dog's name is Heidi";
  const queryEngine = index.asQueryEngine();
  const response = await queryEngine.query({ query });

  console.log("🧠 EchoChamber response:\n", response.toString());
})();

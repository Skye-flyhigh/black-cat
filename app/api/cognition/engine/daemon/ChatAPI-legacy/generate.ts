// Previously was in the chat API but kept for legacy and future ref

import * as dotenv from "dotenv";
import { VectorStoreIndex } from "llamaindex";
import { storageContextFromDefaults } from "llamaindex/storage/StorageContext";
// Load environment variables from local .env file
dotenv.config();

import { createChromaStore } from "../../../chat/engine/chroma/chromaStore";
import { getDocuments } from "./loader";
import { initSettings } from "../../chat/engine/settings";

(async () => {
  await initSettings();

  async function getRuntime(func: any) {
    const start = Date.now();
    await func();
    const end = Date.now();
    return end - start;
  }

  async function generateDatasource() {
    console.log(`🏗️ Generating storage context...`);
    // Split documents, create embeddings and store them in the storage context
    const persistDir = process.env.STORAGE_CACHE_DIR;
    if (!persistDir) {
      throw new Error("STORAGE_CACHE_DIR environment variable is required!");
    }

    const ms = await getRuntime(async () => {
      const documents = await getDocuments();

      // ✅ Create Chroma vector store instance
      const chromaStore = createChromaStore();

      // console.log("🛠️ Building the actual storage", chromaStore);

      const storageContext = await storageContextFromDefaults({
        persistDir,
        vectorStore: chromaStore,
      });

      await VectorStoreIndex.fromDocuments(documents, {
        storageContext,
      });
    });

    console.log(`📣 Echoes successfully gathered in ${ms / 1000}s.`);
  }

  (async () => {
    await generateDatasource();
    console.log(`✅ Echo chamber up and ready.`);
  })();
})();

// Study the query method in this context because that's only there it's been working so far
import * as dotenv from "dotenv";
import { BlackCatVectorStore } from "./chroma/BlackCatChromaVectorStore";
import { getChromaStore } from "./chroma/chromaStore";
import { initSettings } from "./settings";
dotenv.config();

(async () => {
  await initSettings();

  const persistDir = process.env.STORAGE_CACHE_DIR;
  if (!persistDir) {
    throw new Error("STORAGE_CACHE_DIR environment variable is required!");
  }

  const chromaStore = await getChromaStore();

  // Verify store methods are available
  if (!chromaStore || typeof chromaStore.getAll !== "function") {
    throw new Error(
      "😿 ChromaStore initialization failed - getAll method not available",
    );
  }
  // Log store initialization
  console.log(
    "🐱 Store initialized with methods:",
    Object.getOwnPropertyNames(Object.getPrototypeOf(chromaStore)),
  );
  // const index = await VectorStoreIndex.fromVectorStore(chromaStore);

  // const memoryManager = new MemoryManager(chromaStore, chromaStore.embedModel);
  // console.log("🔍 Fetching in the memory files...");

  async function inspectDuplicateHashes(store: BlackCatVectorStore) {
    console.log("🔍 Inspecting store for duplicates...");
    const all = await store.getAll();
    const countByHash = new Map<string, number>();

    console.log(`📊 Total documents found: ${all.length}`);

    // Count occurrences of each hash
    for (const node of all) {
      const hash = node.metadata?.hash;
      if (!hash) {
        console.warn(`⚠️ Missing hash in node ID: ${node.id_}`);
        continue;
      }
      countByHash.set(hash, (countByHash.get(hash) ?? 0) + 1);
    }

    // Report findings
    const duplicates = Array.from(countByHash.entries()).filter(
      ([_, count]) => count > 1,
    );

    if (duplicates.length > 0) {
      console.log("🔁 Duplicate hashes found:");
      duplicates.forEach(([hash, count]) => {
        console.log(`  - Hash: ${hash.substring(0, 8)}... Count: ${count}`);
      });
    }

    console.log(`\n📈 Statistics:`);
    console.log(`  - Total documents: ${all.length}`);
    console.log(`  - Unique hashes: ${countByHash.size}`);
    console.log(`  - Duplicate sets: ${duplicates.length}`);
  }

  async function cleanupCollection(store: BlackCatVectorStore) {
    console.log("🧹 Starting collection cleanup...");

    const all = await store.getAll();
    const hashMap = new Map<string, { id: string; timestamp: number }>();

    console.log("📊 Processing documents:", all.length);

    // Process all documents
    for (const node of all) {
      const hash = node.metadata?.hash;
      const timestamp = parseInt(node.id_.split("-")[1] || "0");

      if (!hash) {
        console.warn(`⚠️ Document without hash found: ${node.id_}`);
        continue;
      }

      // Keep only the newest version of each document
      const existing = hashMap.get(hash);
      if (!existing || timestamp > existing.timestamp) {
        hashMap.set(hash, { id: node.id_, timestamp });
      }
    }
    // Find documents to delete (older duplicates)
    const toDelete = new Set<string>();
    for (const node of all) {
      const hash = node.metadata?.hash;
      if (!hash) continue;

      const newest = hashMap.get(hash);
      if (newest && newest.id !== node.id_) {
        toDelete.add(node.id_);
      }
    }

    if (toDelete.size > 0) {
      console.log(`🗑️ Found ${toDelete.size} documents to clean up`);
      try {
        await store.delete(Array.from(toDelete));
        console.log("✨ Cleanup completed successfully");
      } catch (error) {
        console.error("❌ Error during cleanup:", error);
      }
    } else {
      console.log("✨ Collection is already clean!");
    }
  }

  (async () => {
    try {
      await initSettings();
      const chromaStore = await getChromaStore();

      // Verify store initialization
      if (!chromaStore || typeof chromaStore.getAll !== "function") {
        throw new Error(
          "😿 ChromaStore initialization failed - getAll method not available",
        );
      }

      const shouldCleanup = process.argv.includes("--cleanup");
      if (shouldCleanup) {
        await cleanupCollection(chromaStore);
      }

      console.log("🐱 Starting store inspection...");
      await inspectDuplicateHashes(chromaStore);
    } catch (error) {
      console.error("❌ Error during store inspection:", error);
      process.exit(1);
    }
  })();

  //   const retriever = index.asRetriever();
  //   const nodes = await retriever.retrieve({ query: "Who is Heidi?" });

  //   console.log("🔍 Raw retrieved nodes:", nodes);
  //   console.log(
  //     "🔍 Retrieved Nodes:",
  //     nodes.map(n => ({
  //       text: n.node?.text || "No text available",
  //       source: n.node?.metadata?.source || "No source available",
  //       tags: n.node?.metadata?.tags || "No tags available",
  //     })));  // Adjusted to use a valid property from metadata
  //   const query = "My dog's name is Heidi";
  //   const queryEngine = index.asQueryEngine();
  //   const response = await queryEngine.query({ query }); // The mighty cursed query method

  //   console.log("🧠 EchoChamber response:\n", response.toString());
})();

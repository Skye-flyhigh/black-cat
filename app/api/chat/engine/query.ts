import { TextNode } from "@llamaindex/core/schema";
import { getChromaStore } from "./chroma/chromaStore";
import { MemoryManager } from "./memory/MemoryManager";

async function run() {
  try {
    const chromaStore = await getChromaStore();
    const memoryManager = new MemoryManager(
      chromaStore,
      chromaStore.embedModel,
    );
    // Verify story initialisation
    if (!chromaStore || typeof chromaStore.getAll !== "function") {
      throw new Error(
        "😿 ChromaStore initialization failed - getAll method not available",
      );
    }

    console.log("🧪 Phase 1 Testing Begins");

    // Step 1: Fetch all stored nodes
    const allNodes: TextNode[] = await chromaStore.getAll();
    console.log(`📦 All Nodes Fetched: ${allNodes.length}`);

    if (!allNodes.length) {
      console.warn("😿 No nodes found to test against.");
      return;
    }

    const firstNode = allNodes[2];
    const text = firstNode.text;
    let hash = firstNode.metadata?.hash;
    console.log("Checking node", firstNode);

    if (!hash) {
      console.warn("❓ First node missing a hash. Fixing issue");
      hash = memoryManager.generateHash(text);
    }

    // Step 2: Query by hash directly
    const queryResult = await chromaStore.queryByHash(hash);
    console.log("🔎 queryByHash result:", queryResult.length);

    // Step 3: Use memoryManager.getMemory()
    const memory = await memoryManager.getMemory(hash);
    console.log("🧠 memoryManager.getMemory():", {
      id: memory?.id_,
      weight: memory?.metadata?.weight,
      tags: memory?.metadata?.tags,
    });

    // Step 4: Apply decay to the memory
    if (memory) {
      await memoryManager.decayWeights(memory);
      console.log("⏳ decayWeights applied");
    }

    // Step 5: Re-fetch memory after decay
    const updatedMemory = await memoryManager.getMemory(hash);
    console.log("🧪 Updated Memory After Decay:", {
      weight: updatedMemory?.metadata?.weight,
    });
  } catch (error) {
    console.error("🔥 Test failed with error:", error);
  }
}

run();

import * as dotenv from "dotenv";
import { ChatMessage, VectorStoreIndex } from "llamaindex";
import { getChromaStore } from "./chroma/chromaStore";
import { MemoryManager } from "./memory/MemoryManager";
dotenv.config();

export async function handleAsk(messages: ChatMessage[]): Promise<Response> {
  // await initSettings();
  const chromaStore = await getChromaStore();
  const memoryManager = new MemoryManager(chromaStore, chromaStore.embedModel);
  if (!chromaStore || typeof chromaStore.getAll !== "function") {
    throw new Error(
      "😿 ChromaStore initialization failed - getAll method not available",
    );
  }

  //Select only the last message of the chat - 👺 limiting hoarding data in memories
  const userMessage = messages[messages.length - 1]?.content || "";

  // Log the user message
  await memoryManager.addMemory({
    text: userMessage,
    metadata: {
      source: "user",
      timestamp: new Date().toISOString(),
    },
  });

  const index = await VectorStoreIndex.fromVectorStore(chromaStore);
  const queryEngine = index.asQueryEngine();
  const response = await queryEngine.query({ query: userMessage });

  const result = response.toString();
  console.log(`🐾 Black-Cat says: "${result}"`);

  // Log the cat's response
  await memoryManager.addMemory({
    text: result,
    metadata: {
      timestamp: new Date().toISOString(),
      source: "assistant",
    },
  });

  return new Response(result + "\n", {
    headers: { "Content-Type": "text/plain" },
  });
}

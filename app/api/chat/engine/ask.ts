import { ChatMessage, VectorStoreIndex } from "llamaindex";
import { initSettings } from "./settings";
import { logMemory } from "./memory/logMemory";
import { getChromaStore } from "./chroma/chromaStore";
import * as dotenv from "dotenv";
dotenv.config();

export async function handleAsk(messages: ChatMessage[]): Promise<Response> {
  // await initSettings();
  const chromaStore = await getChromaStore();

  //Select only the last message of the chat - 👺 limiting hoarding data in memories
  const userMessage = messages[messages.length - 1]?.content || "";

  // Log the user message
  await logMemory({
    message: userMessage,
    metadata: {
      timestamp: new Date().toISOString(),
      source: "user",
    }
  });

  const index = await VectorStoreIndex.fromVectorStore(chromaStore);
  const queryEngine = index.asQueryEngine();
  const response = await queryEngine.query({ query: userMessage });

  const result = response.toString();
  console.log(`🐾 Black-Cat says: "${response.toString()}"`);
  
  // Log the cat's response
  await logMemory({
    message: result,
    metadata: {
      timestamp: new Date().toISOString(),
      source: "assistant",
    }
  });

        return new Response(result + '\n', {
      headers: { 'Content-Type': 'text/plain' },
    });
}
import * as dotenv from "dotenv";
import { ChatMessage, VectorStoreIndex } from "llamaindex";
import { getChromaStore } from "./chroma/chromaStore";
import { MemoryManager } from "./memory/MemoryManager";
dotenv.config();

export async function handleAsk(messages: ChatMessage[]): Promise<Response> {
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

  const index = VectorStoreIndex.fromVectorStore(chromaStore);
  const chatEngine = (await index).asChatEngine({
    similarityTopK: Number(process.env.TOP_K) || 5,
    systemPrompt: process.env.SYSTEM_PROMPT,
    contextWindow: 4096, // Add this to manage context size
    timeoutMs: 60000, // Add timeout for long operations
  });
  const stream = await chatEngine.chat({ message: userMessage, stream: true });

  // Not for my project but for superficial chatbot it's perfect. I have memorymanager.
  // const chatMemory = new ChatMemoryBuffer({tokenLimit: 40000})

  // const finalText = response;

  // Store final response in memory
  // await memoryManager.addMemory({
  //   text: finalText,
  //   metadata: {
  //     timestamp: new Date().toISOString(),
  //     source: "assistant",
  //   },
  // });

  // Create transform stream to handle chunks
  const transformStream = new TransformStream({
    async transform(chunk, controller) {
      if (chunk && typeof chunk === "object") {
        const text = chunk.delta || chunk.response || "";
        controller.enqueue(text);

        // Store chunk in memory
        await memoryManager.addMemory({
          text: text,
          metadata: {
            timestamp: new Date().toISOString(),
            source: "assistant",
          },
        });
      }
    },
  });

  // Create readable stream from async iterator
  const readable = new ReadableStream({
    async start(controller) {
      for await (const chunk of stream) {
        const text = chunk.delta || chunk.response || "";
        controller.enqueue(text);
      }
      controller.close();
    },
  });

  return new Response(readable.pipeThrough(transformStream), {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}

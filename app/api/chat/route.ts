import { initObservability } from "@/app/observability";
import { Ollama } from "@llamaindex/ollama";
import { Message } from "ai";
import * as dotenv from "dotenv";
import { ChatMemoryBuffer, ChatMessage } from "llamaindex";
import { NextRequest, NextResponse } from "next/server";
import { createBlackCatEngine } from "./engine/chat";
import { getChromaStore } from "./engine/chroma/chromaStore";
import { MemoryManager } from "./engine/memory/MemoryManager";
import { initSettings } from "./engine/settings";
import { isValidMessages } from "./llamaindex/streaming/annotations";
dotenv.config;

initObservability(); //Empty for now
const { llm, embedder } = await initSettings();

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { messages }: { messages: Message[] } = body;
    const userMessage = messages[messages.length - 1];
    if (!userMessage || userMessage.role !== "user") {
      //messages role are still "user"
      return NextResponse.json(
        { detail: "Last message is not a user message" },
        { status: 400 },
      );
    }
    if (!isValidMessages(messages)) {
      return NextResponse.json(
        {
          error:
            "messages are required in the request body and the last message must be from the user",
        },
        { status: 400 },
      );
    }
    const chatMemory = new ChatMemoryBuffer({ tokenLimit: 6144 });

    for (const msg of messages) {
      //have to see the limit...
      await chatMemory.put({
        content: msg.content,
        role: msg.role as "user" | "assistant",
      });
    }
    // Get recent context
    const recentMessages = await chatMemory.getMessages();

    // Phase 1: Remembering
    const tinyOllama = new Ollama({
      model: "gemma3:1b",
      config: {
        baseUrl: process.env.BASE_URL || "http://127.0.0.1:11434",
      },
      options: {
        temperature: Number(process.env.LLM_TEMPERATURE) || 0.7,
        num_ctx: Number(process.env.LLM_MAX_TOKEN) || 4096,
        top_p: Number(process.env.TOP_P) || 0.9,
      },
    });

    const chromaStore = await getChromaStore();
    const memoryStore = new MemoryManager(
      chromaStore,
      chromaStore.embedModel,
      tinyOllama,
      embedder,
    );

    const userInput = `${userMessage.content}`;
    console.log("💁 User input:", userInput);

    const blackCat = await createBlackCatEngine(memoryStore);
    const response = await blackCat.chat({
      message: userInput,
      chatHistory: recentMessages as ChatMessage[],
      chatOptions: {
        maxTokens: 150,
      },
      stream: true,
    });

    //Stream to handle little chunks
    const readable = new ReadableStream({
      async start(controller) {
        // Make sure response is a ReadableStream and get its reader
        const reader = response.getReader();
        if (!reader) throw new Error("Failed to get reader from response");

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          // Assuming the response is coming as Uint8Array, decode it
          // const text = new TextDecoder().decode(value);
          try {
            const content = value?.message?.content;
            if (content && typeof content === "string") {
              // Format the chunk as a JSON string with newline delimiter
              const chunk = JSON.stringify({ message: { content } }) + "\n";
              controller.enqueue(chunk);
            }
          } catch (e) {
            console.error("Error processing chunk:", e);
          }
        }

        controller.close();
      },
    });
    console.log(`🗣️ ${llm.model} said:`, response);

    return new NextResponse(readable, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    console.error("[Black-Cat] POST error", error);
    return NextResponse.json(
      {
        detail: (error as Error).message,
      },
      {
        status: 500,
      },
    );
  }
}

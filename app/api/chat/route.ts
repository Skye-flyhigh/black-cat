import { initObservability } from "@/app/observability";
import { Message } from "ai";
import * as dotenv from "dotenv";
import { ChatMemoryBuffer, ChatMessage } from "llamaindex";
import { NextRequest, NextResponse } from "next/server";
import { createBlackCatEngine } from "./engine/chat";
import { getChromaStore } from "@/app/lib/chroma/chromaStore";
import { MemoryManager } from "@/app/lib/memory/MemoryManager";
import { isValidMessages } from "./llamaindex/streaming/annotations";
import { classifierLlama } from "@/app/lib/llama-barn/tiny-llamas";
import { embeddingLlama } from "@/app/lib/llama-barn/embedded-llamas";
import { conversationalLlama } from "@/app/lib/llama-barn/llamas";
import { ContextualStateAdjuster } from "../cognition/engine/state/ContextualStateAdjuster";
import * as fs from "fs";
dotenv.config;

initObservability(); //Empty for now

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

    const tinyOllama = classifierLlama;
    const embedder = embeddingLlama;
    const voice = conversationalLlama;

    const chromaStore = await getChromaStore();
    const memoryStore = new MemoryManager(
      chromaStore,
      chromaStore.embedModel,
      tinyOllama,
      embedder,
    );

    const userInput: string = `${userMessage.content}`;
    console.log("💁 User input:", userInput);

    // Generate dynamic consciousness state based on context
    console.log("🧠 Generating dynamic consciousness state...");
    const stateAdjuster = new ContextualStateAdjuster();
    const dynamicDaemonState = await stateAdjuster.adjustStateFromContext(
      userInput,
      recentMessages,
      // TODO: Pass previous injection for contradiction detection
    );

    const consciousnessInjection = JSON.parse(fs.readFileSync(`./app/api/cognition/config/system-prompt.json`, 'utf-8'));

    const blackCat = await createBlackCatEngine(memoryStore, consciousnessInjection?.promptDelta);
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
    console.log(`🗣️ ${voice.model} said:`, response);

    return new NextResponse(readable, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
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

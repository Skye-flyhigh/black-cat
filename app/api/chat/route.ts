import { initObservability } from "@/app/observability";
import { LlamaIndexAdapter, Message } from "ai";
import { NextRequest, NextResponse } from "next/server";
import { createBlackCatEngine } from "./engine/chat";
import { getChromaStore } from "./engine/chroma/chromaStore";
import { MemoryManager } from "./engine/memory/MemoryManager";
import { initSettings } from "./engine/settings";
import { isValidMessages } from "./llamaindex/streaming/annotations";
import { ChatMessage } from "llamaindex";

initObservability(); //Empty for now
const { embedModel } = await initSettings();

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { messages }: { messages: Message[] } = body;
    const userMessage = messages[messages.length - 1];
    if (!userMessage || userMessage.role !== "user") {
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
    
    const chromaStore = await getChromaStore();
    const memoryStore = new MemoryManager(
      chromaStore,
      chromaStore.embedModel,
      embedModel,
    );
    const agent = await createBlackCatEngine(memoryStore);
    // type ChatMessage = {
    //   role: "user" | "assistant" | "system";
    //   content: string;
    // };
    const safeMessages = messages.map((m) => ({
      role: m.role ?? "user",
      content: m.content ?? "",
    }));
    if (safeMessages.length === 0) {
      return new Response("No valid messages to process", { status: 400 });
    }
    const response = await agent.chat({ 
      message: userMessage.content, 
      chatHistory:  messages as ChatMessage[] 
    });
    // useAssistant? AssistantResponse? EngineResponse?
    

return new NextResponse(response.message.content);

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

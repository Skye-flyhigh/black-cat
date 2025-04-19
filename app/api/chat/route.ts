import { initObservability } from "@/app/observability";
import { Message } from "ai";
import { ChatMemoryBuffer, ChatMessage } from "llamaindex";
import { NextRequest, NextResponse } from "next/server";
import { CognitionStream } from "./cognition/CognitionStream";
import { createBlackCatEngine } from "./engine/chat";
import { initSettings } from "./engine/settings";
import { isValidMessages } from "./llamaindex/streaming/annotations";

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
    //FIXME: Little chat memory buffer just in case of long conversation, I don't want to chock the poor cat
    const chatMemory = new ChatMemoryBuffer({ tokenLimit: 40000 });
    async function getChatHistory() {
      const messages = await chatMemory.getAllMessages();
      return messages;
    } //Going anywhere for now

    //FIXME: Hopefully fix this CognitionStream to have a cute backend connected loader...
    const { memoryStore, monologue } = await CognitionStream({
      llm,
      embedder,
      messages,
      userMessage,
    });

    //Main character enters the scene:
    const agent = await createBlackCatEngine(
      memoryStore,
      userMessage.content,
      monologue,
    );

    //Stream to handle little chunks
    const response = await agent.chat({
      message: userMessage.content,
      chatHistory: messages as ChatMessage[],
      stream: true, //This should allow little chunks coming out
    });

    const readable = new ReadableStream({
      async start(controller) {
        const reader = response.getReader();

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const content = value?.message?.content;
          if (content && typeof content === "string") {
            console.log("🪄 Streamed content:", content);
            controller.enqueue(content);
          }
        }

        controller.close();
      },
    });

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

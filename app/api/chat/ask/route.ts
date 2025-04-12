import { streamText } from "ai";
import { Settings } from "llamaindex";
import { handleAsk } from "../engine/ask";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { messages } = body;
    console.log("📮 POST from ask/route.ts");

    // Format checks
    if (!Array.isArray(messages) || messages.length === 0) {
      return new Response("❌ Invalid messages array - Dev stuff you know", {
        status: 400,
      });
    }

    const lastMessage = messages[messages.length - 1];
    if (!lastMessage || typeof lastMessage.content !== "string") {
      return new Response("❌ Missing message content - Say something!", {
        status: 400,
      });
    }

    // 🧠 Recall memory with context enrichment
    const recalled = await handleAsk(lastMessage.content);

    // 🗣️ Stream the assistant’s enriched response
    const streamResult = await streamText({
      model: Settings.llm,
      messages: [...messages, { role: "assistant", content: recalled }],
    });

    return streamResult.toTextStreamResponse();
  } catch (err: any) {
    console.error("Error in /api/chat/ask:", err);
    return new Response("☠️ Internal server error - Gremlin tricks", {
      status: 500,
    });
  }
}

"use client";

import "@llamaindex/chat-ui/styles/markdown.css";
import "@llamaindex/chat-ui/styles/pdf.css";
import { ChatProvider } from "./ChatProvider";
import CustomChatInput from "./ui/chat/chat-input";
import CustomChatMessages from "./ui/chat/chat-messages";
import { useClientConfig } from "./ui/chat/hooks/use-config";
import {
  StreamingChatHandler,
  useStreamingChat,
} from "./ui/chat/hooks/use-streaming-chat";
import { useEffect } from "react";

export default function ChatSection() {
  const { backend } = useClientConfig();

  const handler: StreamingChatHandler = useStreamingChat({
    api: `${backend}/api/chat`,
    streamProtocol: "json",
    onError: (error: unknown) => {
      console.error("❌ Error received on chat-section frontend:", error);
      if (!(error instanceof Error)) throw error;
      let errorMessage: string;
      try {
        errorMessage = JSON.parse(error.message).detail;
      } catch (e) {
        errorMessage = error.message;
      }
      alert(errorMessage);
    },
  });

  const { messages } = handler

  useEffect(() => {
    console.log("💬 All messages:", messages);
  }, [messages]);

  return (
    <div className="flex flex-col h-full w-full ">
      <ChatProvider handler={handler}>
        <CustomChatMessages />
        <CustomChatInput />
      </ChatProvider>
    </div>
  );
}

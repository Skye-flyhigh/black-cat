"use client";

import { Message } from "@llamaindex/chat-ui";
import { useChatContext } from "../../ChatProvider";
import { ChatMessageAvatar } from "./chat-avatar";
import { ChatMessageContent } from "./chat-message-content";
import { StreamingChatHandler, useStreamingStore } from "./hooks/use-streaming-chat";

export default function CustomChatMessages() {
  const { handler }: { handler: StreamingChatHandler } = useChatContext();
  const messages = useStreamingStore((state) => state.messages);
  const { streamingMessage, isStreaming } = handler;

  console.log("Rendering messages", messages);

  return (
    <div className="flex-1 overflow-y-auto space-y-4 p-4">
      {messages.map((message, index) => (
        <div key={index} className="flex items-start gap-4">
          <ChatMessageAvatar message={message} />
          <ChatMessageContent message={message} />
        </div>
      ))}

      {isStreaming && (
        <div className="flex items-start gap-4">
          <ChatMessageAvatar
            message={{
              role: "assistant",
              content: streamingMessage || "Thinking...",
            }}
          />
          <div className="animate-pulse">
            <ChatMessageContent
              message={{
                role: "assistant",
                content: streamingMessage || "Thinking...",
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}

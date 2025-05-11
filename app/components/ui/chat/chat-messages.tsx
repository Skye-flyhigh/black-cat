"use client";

import { Message } from "@llamaindex/chat-ui";
import { useChatContext } from "../../ChatProvider";
import { ChatMessageAvatar } from "./chat-avatar";
import { ChatMessageContent } from "./chat-message-content";
import { StreamingChatHandler, useMessageStore, useStreamingStore } from "./hooks/use-streaming-chat";
import { shallow } from "zustand/shallow";
import { useMemo } from "react";

export default function CustomChatMessages() {
  const { handler }: { handler: StreamingChatHandler } = useChatContext();
  // const messages = useMessageStore((state) => state.messages, shallow);
  const { streamingMessage, isStreaming, messages } = handler;

  const allMessages: Message[] = useMemo(() => {
    if(isStreaming && streamingMessage){
      return [...messages, { role: "assistant", content: streamingMessage}]
    }
    return messages;
  }, [messages, streamingMessage, isStreaming])

  return (
    <div className="flex-1 overflow-y-auto space-y-4 p-4">
      {allMessages.map((message, index) => (
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

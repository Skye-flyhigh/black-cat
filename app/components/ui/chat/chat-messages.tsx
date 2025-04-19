"use client";

import { ChatMessage, ChatMessages, useChatUI } from "@llamaindex/chat-ui";
import { ChatMessageAvatar } from "./chat-avatar";
import { ChatMessageContent } from "./chat-message-content";
import { ChatStarter } from "./chat-starter";
import { CognitionLoader } from "./CognitionLoader";
import { useCognitionStream } from "./hooks/useCognitionStream";

export default function CustomChatMessages() {
  const { messages } = useChatUI();
  const { stage: loaderStage } = useCognitionStream("/api/chat/cognition");
  return (
    <ChatMessages className="shadow-xl rounded-xl">
      <ChatMessages.List>
        {messages.map((message, index) => (
          <ChatMessage
            key={index}
            message={message}
            isLast={index === messages.length - 1}
          >
            <ChatMessageAvatar />
            <ChatMessageContent />
            <ChatMessage.Actions />
          </ChatMessage>
        ))}
        {false && <ChatMessages.Loading />}

        <CognitionLoader
          stage={loaderStage === "idle" ? undefined : loaderStage}
        />
      </ChatMessages.List>
      <ChatMessages.Actions />
      <ChatStarter />
    </ChatMessages>
  );
}

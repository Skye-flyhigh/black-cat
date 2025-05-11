import { Message } from "@llamaindex/chat-ui";
import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from "react";
import { StreamingChatHandler, useMessageStore, useStreamingStore } from "./ui/chat/hooks/use-streaming-chat";
import { shallow } from "zustand/shallow";

interface ChatContextType {
  // messages: Message[];
  handler: StreamingChatHandler;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export function ChatProvider({
  children,
  handler,
}: {
  children: ReactNode;
  handler: StreamingChatHandler;
}) {
    // const messages = useMessageStore(state => state.messages, shallow);

 const contextValue = useMemo(() => ({
    // messages,
    handler
  }), [handler]);

  return (
    <ChatContext.Provider value={ contextValue }>
      {children}
    </ChatContext.Provider>
  );
}

export function useChatContext() {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error("useChatContext must be used within a ChatProvider");
  }
  return context;
}

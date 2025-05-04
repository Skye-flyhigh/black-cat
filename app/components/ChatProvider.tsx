import { Message } from "@llamaindex/chat-ui";
import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from "react";
import { StreamingChatHandler, useStreamingStore } from "./ui/chat/hooks/use-streaming-chat";

interface ChatContextType {
  messages: Message[];
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
    const zustandMessages = useStreamingStore(state => state.messages);
    const [messages, setMessages] = useState<Message[]>(zustandMessages); // Init once
    
    useEffect(() => {
      setMessages(zustandMessages);
    }, [zustandMessages]);

 const contextValue = useMemo(() => ({
    messages,
    handler
  }), [handler, messages]);

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

import { ChatHandler, Message } from "@llamaindex/chat-ui";
import { useCallback, useState } from "react";
import { create } from "zustand";

export interface StreamingChatHandler extends ChatHandler {
  streamingMessage: string;
  isStreaming: boolean;
  fetchModelResponse: any;
}
export type StreamProtocol = "text" | "json" | "sse";

interface StreamingChatOptions {
  api: string;
  streamProtocol?: StreamProtocol;
  onError?: (error: unknown) => void;
}

interface StreamingState {
  messages: Message[];
  streamingMessage: string;
  isStreaming: boolean;
  setMessages: (messages: Message[] | ((prev: Message[]) => Message[])) => void;
  setStreamingMessage: (message: string) => void;
  setIsStreaming: (isStreaming: boolean) => void;
  reset: () => void;
}

export const useStreamingStore = create<StreamingState>((set) => ({
  messages: [], // Add messages to store
  streamingMessage: "",
  isStreaming: false,
  setMessages: (messages) => set((state) => ({
    messages: typeof messages === 'function' ? messages(state.messages) : messages
  })),
  setStreamingMessage: (message) => set({ streamingMessage: message }),
  setIsStreaming: (isStreaming) => set({ isStreaming }),
  reset: () => set({ streamingMessage: "", isStreaming: false }), // Don't reset messages on reset
}));

export const useStreamingMessage = () => {
  const streamingMessage = useStreamingStore((state) => state.streamingMessage);
  const isStreaming = useStreamingStore((state) => state.isStreaming);
  return { streamingMessage, isStreaming };
};

export function useStreamingChat({
  api,
  streamProtocol = "json",
  onError
}: StreamingChatOptions): StreamingChatHandler {
  const [input, setInput] = useState<string>(""); // input: string; setInput: Dispatch<SetStateAction<string>>;
  const [isLoading, setIsLoading] = useState(false);
  const { 
    setStreamingMessage, 
    setIsStreaming, 
    setMessages, // Get setMessages from store
    messages, // Get messages from store
    reset 
  } = useStreamingStore();
  const normalizedProtocol = (streamProtocol || "text").toLowerCase() as StreamProtocol;

  const handleStreamChunk = useCallback((chunk: string, decoder: TextDecoder) => {
    console.log("🧪 Handling stream chunk with:", streamProtocol, chunk);

    switch (normalizedProtocol) {
      case "json":
        try {
          const parsed = JSON.parse(chunk);
          return parsed.message?.content || "";
        } catch (e) {
          console.error("Failed to parse JSON chunk:", e);
          return "";
        }
      case "sse":
        // Handle Server-Sent Events format
        if (chunk.startsWith("data: ")) {
          const data = chunk.slice(6);
          try {
            const parsed = JSON.parse(data);
            return parsed.message?.content || "";
          } catch (e) {
            return data;
          }
        }
        return "";
      case "text":
      default:
        // Handle plain text chunks
        return chunk;
    }
  }, [streamProtocol]);

  const fetchModelResponse = async (messages: Message[]) => {
      let finalAssistantMessage: Message = {
        role: "assistant",
        content: "",
      }

        try {
          setIsLoading(true);
          setIsStreaming(true);
          setStreamingMessage("");
          console.log("Starting stream...");

          const response = await fetch(api, {
            method: "POST",
            headers: { "Content-Type": "application/json",
              "Accept": normalizedProtocol === "sse" ? "text/event-stream" : "application/json"
             },
            body: JSON.stringify({
              messages: [...messages], // Include the new user message
            }),
          });

          if (!response.body) throw new Error("No response body");
          console.log("Got response body");

          const reader = response.body.getReader();
          const decoder = new TextDecoder();
          let buffer = "";
          let accumulatedContent = "";

          while (true) {
            const { done, value } = await reader.read();
            console.log("Stream chunk received:", { done, hasValue: !!value });

            if (done) {
              console.log("Stream complete:", accumulatedContent);
              // Add final AI message to history
              finalAssistantMessage.content = accumulatedContent;
              break;
            }

            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split("\n");
            buffer = lines.pop() || "";

            for (const line of lines) {
              if (line.trim()) {
                try {
                  const content = handleStreamChunk(line, decoder);
                  console.log("Received chunk:", content);
                  if (content) {
                    accumulatedContent += content;
                    setStreamingMessage(accumulatedContent);
                    console.log(
                      "Updated streaming message:",
                      accumulatedContent,
                    );
                  }
                } catch (e) {
                  console.error("Failed to parse chunk:", line, e);
                }
              }
            }
          }
        } catch (error) {
          console.error("Streaming error:", error);
          onError?.(error)
        } finally {
          console.log("Stream ended, cleaning up...");
          setIsLoading(false);
          setIsStreaming(false);
          setStreamingMessage("");
        }
        return finalAssistantMessage;
      }

  const append = async (
      message: Message,
      chatRequestOptions?: { data?: any },
    ): Promise<string | null | undefined> => {
      setMessages(prev => [...prev, message]); 
      return message.content
    };

  return {
    input,
    setInput,
    messages,
    isLoading,
    append,
    fetchModelResponse,
    streamingMessage: useStreamingStore((state) => state.streamingMessage),
    isStreaming: useStreamingStore((state) => state.isStreaming),
  };
}

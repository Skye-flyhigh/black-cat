import {
  ContentPosition,
  getSourceAnnotationData,
  Message,
} from "@llamaindex/chat-ui";
import { DeepResearchCard } from "./custom/deep-research-card";
import { Markdown } from "./custom/markdown";
import { ToolAnnotations } from "./tools/chat-tools";
import { useChatContext } from "../../ChatProvider";

export function ChatMessageContent({ message }: { message: Message }) {
  const { handler } = useChatContext();
  const { streamingMessage, isStreaming } = handler;

  console.log("Multi logging of the stream:", {
    isStreaming,
    streamingMessage,
    messageContent: message.content,
  });

  // Use streaming message if available, otherwise use regular message content
  const content = isStreaming ? streamingMessage : message.content;

  const customContent = [
    {
      position: ContentPosition.MARKDOWN,
      component: (
        <Markdown
          content={content}
          sources={getSourceAnnotationData(message.annotations)?.[0]}
        />
      ),
    },
    {
      position: ContentPosition.CHAT_EVENTS,
      component: !isStreaming && <DeepResearchCard message={message} />,
    },
    {
      position: ContentPosition.AFTER_EVENTS,
      component: !isStreaming && <ToolAnnotations message={message} />,
    },
  ].filter((item) => item.component); // Remove null components

  return (
    <div className="flex flex-col gap-4 w-full max-w-3xl animate-slideIn">
      {/* Main message content with Markdown */}
      <div className="prose prose-invert max-w-none">
        <Markdown content={content} sources={message.annotations?.sources} />
      </div>

      {/* Additional components only shown for completed messages */}
      {!isStreaming && (
        <>
          <DeepResearchCard message={message} />
          <ToolAnnotations message={message} />
        </>
      )}
    </div>
  );
}

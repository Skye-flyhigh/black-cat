"use client";

import { Message } from "@llamaindex/chat-ui";
import { useChatContext } from "../../ChatProvider";
import { useMessageStore } from "./hooks/use-streaming-chat";
import { shallow } from "zustand/shallow";

export default function CustomChatInput() {
  const { handler } = useChatContext();
  const { input, setInput, isLoading, messages, fetchModelResponse } = handler;
  // const messages = useMessageStore((state) => state.messages, shallow)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    try {
      if(!isLoading && input ){ 
        const userMsg: Message = {
          role: "user",
          content: input.trim(),
        };
        
        setInput(""); // Clear input after sending
      await handler.append(userMsg);

      const newMessages = [...messages, userMsg];
      const response = await fetchModelResponse([...newMessages, userMsg])
      await handler.append(response)

    }} catch (error) {
      console.error("Failed to send message:", error);
  };
  }
  
  // const { backend } = useClientConfig();
  // const {
  //   imageUrl,
  //   setImageUrl,
  //   uploadFile,
  //   files,
  //   removeDoc,
  //   reset,
  //   getAnnotations,
  // } = useFile({ uploadAPI: `${backend}/api/chat/upload` });

  /**
   * Handles file uploads. Overwrite to hook into the file upload behavior.
   * @param file The file to upload
   */
  // const handleUploadFile = async (file: File) => {
  //   // There's already an image uploaded, only allow one image at a time
  //   if (imageUrl) {
  //     alert("You can only upload one image at a time.");
  //     return;
  //   }

  //   try {
  //     // Upload the file and send with it the current request data
  //     await uploadFile(file, requestData);
  //   } catch (error: any) {
  //     // Show error message if upload fails
  //     alert(error.message);
  //   }
  // };

  // Get references to the upload files in message annotations format, see https://github.com/run-llama/chat-ui/blob/main/packages/chat-ui/src/hook/use-file.tsx#L56
  // const annotations = getAnnotations();

  return (
    <form
      onSubmit={handleSubmit}
      className="p-4 border-t border-gray-200 dark:border-gray-800 w-full"
    >
      <div className="flex gap-2">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Come chat with me..."
          className="flex-1 p-2 rounded-lg bg-gray-100 dark:bg-gray-800 
                   border border-gray-200 dark:border-gray-700
                   focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={isLoading}
        />
        <button
          type="submit"
          disabled={isLoading}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg
                   disabled:opacity-50 disabled:cursor-not-allowed
                   hover:bg-blue-600 transition-colors"
        >
          {isLoading ? "Sending..." : "Send"}
        </button>
      </div>
    </form>
  );
}

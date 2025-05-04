import { Message } from "@llamaindex/chat-ui";
import { BaseEmbedding, ChatMessage, LLM } from "llamaindex";
import { emitPhase } from "../emitPhase";
import { createVaultArchivist } from "../engine/chat";
import { getChromaStore } from "../engine/chroma/chromaStore";
import { MemoryManager } from "../engine/memory/MemoryManager";

export async function CognitionStream({
  llm,
  embedder,
  messages,
  userMessage,
}: {
  llm: LLM;
  embedder: BaseEmbedding;
  messages: Message[];
  userMessage: Message;
}) {
  const { writable } = new TransformStream();
  const writer = writable.getWriter();
  const send = (phase: string) => writer.write(emitPhase(phase));

  // Phase 1: Remembering
  send("remembering");
  const chromaStore = await getChromaStore();
  const memoryStore = new MemoryManager(
    chromaStore,
    chromaStore.embedModel,
    llm,
    embedder,
  );

  const userInput = `Skye just queried: ${userMessage.content}`;
  console.log("💁 User input:", userInput);

  const archivist = await createVaultArchivist(memoryStore);
  const echoes = await archivist.chat({
    message: userInput,
    chatHistory: messages as ChatMessage[],
    chatOptions: {
      maxTokens: 150,
    },
  });
  console.log("🗣️ Archivist echoes:", echoes.message.content);

  // Phase 2: Reflecting
  send("reflecting");
  console.log("📦 Inner monologue using LLM:", llm.metadata.model);
  const monologue = await memoryStore.innerMonologue({
    trigger: `Skye (they/them) just queried '${userMessage.content} and echoes from the memories vault ${echoes.message.content}`, //TODO: inject the echoes here?
    currentThoughts: messages as ChatMessage[],
  });

  // Phase 3: Responding
  send("responding");
  writer.close();
  return { memoryStore, monologue, echoes, archivist };
}

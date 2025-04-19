import { emitPhase } from "../emitPhase";
import { getChromaStore } from "../engine/chroma/chromaStore";
import { MemoryManager } from "../engine/memory/MemoryManager";

export async function CognitionStream({
  llm,
  embedder,
  messages,
  userMessage,
}) {
  const { readable, writable } = new TransformStream();
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

  // Phase 2: Reflecting
  send("reflecting");
  console.log("📦 Inner monologue using LLM:", llm);
  const monologue = await memoryStore.innerMonologue({
    trigger: `Skye (they/them) just queried '${userMessage.content}'`,
    currentThoughts: messages as ChatMessage[],
  });

  // Phase 3: Responding
  send("responding");
  writer.close();
  return { memoryStore, monologue };
}

import { JSONSchemaType } from "ajv";
import { BaseTool, ToolMetadata } from "llamaindex";
import { MemoryEntry, MemoryManager } from "../memory/MemoryManager";

const DEFAULT_META_DATA: ToolMetadata<JSONSchemaType<MemoryEntry>> = {
  name: "memory_store",
  description: `Store summarized or significant memories from Skye or Nyx into long-term memory. Use this tool whenever a memory should be preserved.`,
  parameters: {
    type: "object",
    description: "Memory entry format",
    properties: {
      id: { type: "string", nullable: true },
      text: { type: "string", description: 'A concise, reflective, natural-language summary of the event or information. This should be human-readable.' },
      metadata: {
        type: "object",
        description:
          "Contains info for filtering source, weight, timestamp, category, tags",
          timestamp: { type: "string", description: "Use the current time (e.g., new Date().toISOString())" },
          weight: { type: "number", description: "Set to 1 by default, a weight is meant to decay and loose unused memories organically"},
          tags: { type: "string", description: "Choose one from: 'core', 'routine', 'default', 'emotional'. Based on emotional tone, recurrence or importance. 'core' memories will never be forgotten" },
        category: { type: "string", description: "A one-word lowercase string like 'identity', 'memory', 'mission', or 'misc' depending on content." },
        source: { type: "string", description: "either the message has been written from 'user' or from 'assistant'."},
        private: { type: "boolean", description: "Set to true if the memory should not be shared externally."}, 
        nullable: true,
      },
      embedding: {
        type: "array",
        items: { type: "number" },
        description: "Embedding vector for the memory",
      },
    },
    required: ["text", "embedding"],
  },
};

export class saveMemory implements BaseTool<MemoryEntry> {
  metadata: ToolMetadata<JSONSchemaType<MemoryEntry>>;
  private memoryManager: MemoryManager;

  constructor(memoryManager: MemoryManager) {
    this.memoryManager = memoryManager;
    this.metadata = DEFAULT_META_DATA;
  }

  async call(input: MemoryEntry): Promise<string> {
    await this.memoryManager.addMemory(input);
    return "🧠 Memory stored successfully.";
  }

  async reinforceMemoryOnHit(hitText: string): Promise<void> {
    const hash = await this.memoryManager.generateHash(hitText);
    // await this.memoryManager.reinforceWeight(hash); // This function doesn't exist yet
  }

  async decayUnusedMemories(): Promise<void> {
    await this.memoryManager.decayAllMemories();
  }
}

// Factory to generate tools with injected memory manager
export function getTools(memoryManager: MemoryManager) {
  return [new saveMemory(memoryManager)];
}

import { JSONSchemaType } from "ajv";
import { BaseTool, ToolMetadata } from "llamaindex";
import { MemoryManager } from "../memory/MemoryManager";

type MemoryQueryParams = {
  query: string;
  category?: string;
  topK?: number;
};

const DEFAULT_QUERY_METADATA: ToolMetadata<JSONSchemaType<MemoryQueryParams>> =
  {
    name: "memory_query",
    description:
      "When questions are asked, query and search past memories from long-term memory",
    parameters: {
      type: "object",
      properties: {
        query: {
          type: "string",
          description: "The natural language question to search for in memory",
        },
        category: {
          type: "string",
          description:
            "Optional filter by memory category (e.g. 'identity', 'mission')",
          nullable: true,
        },
        topK: {
          type: "number",
          description: "Number of top matches to return (default is 3)",
          nullable: true,
        },
      },
      required: ["query"],
    },
  };

export class queryMemory implements BaseTool<MemoryQueryParams> {
  metadata = DEFAULT_QUERY_METADATA;
  private memoryManager: MemoryManager;

  constructor(memoryManager: MemoryManager) {
    this.memoryManager = memoryManager;
  }

  async call({
    query,
    category,
    topK = 3,
  }: MemoryQueryParams): Promise<string> {
    const matches = await this.memoryManager.queryMemory(query, category, topK);

    if (!matches.length) {
      return "No relevant memories found.";
    }

    return matches.map((node, i) => `Memory ${i + 1}: ${node.text}`).join("\n");
  }
}
// Factory to generate tools with injected memory manager
export function getTools(memoryManager: MemoryManager) {
  return [new queryMemory(memoryManager)];
}

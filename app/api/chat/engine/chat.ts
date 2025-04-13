import * as dotenv from "dotenv";
import { BaseChatEngine, BaseToolWithCall, LLMAgent } from "llamaindex";
import fs from "node:fs/promises";
import path from "node:path";
import { BlackCatVectorStore } from "./chroma/BlackCatChromaVectorStore";
import { getDataSource } from "./index";
import { createTools } from "./tools";
import { saveMemory } from "./tools/saveMemory";
import { PersonalityTool } from "./tools/persona";
import { createQueryEngineTool } from "./tools/query-engine";
import { MemoryQueryTool } from "./tools/queryMemory";
dotenv.config();

export async function createBlackCatEngine(memoryStore: BlackCatVectorStore) {
  const tools: BaseToolWithCall[] = [];

  // Add built-in tools
  tools.push(new PersonalityTool());
  tools.push(new saveMemory(memoryStore));
  tools.push(new MemoryQueryTool(memoryStore))
  // TODO: Add MemoryTool, WorkflowTool, etc here as system grows

  const agent = new LLMAgent({
    tools,
    systemPrompt: process.env.SYSTEM_PROMPT,
  });

  return agent;
}

/**
 * Black Cat Agent:
 * Handles local tool-based reasoning and memory augmentation.
 * Modular tools are configured above.
 */

// Placeholder for future agents
// export async function createMemoryAgent(...) {
//   ...
// }

// Original LlamaIndex ChatEngine
export async function createChatEngine(documentIds?: string[], params?: any) {
  const tools: BaseToolWithCall[] = [];

  // Add a query engine tool if we have a data source
  const index = await getDataSource(params);
  if (index) {
    tools.push(createQueryEngineTool(index, { documentIds }));
  }

  const configFile = path.join("config", "tools.json");
  let toolConfig: any;
  try {
    // Add tools from config file if it exists
    toolConfig = JSON.parse(await fs.readFile(configFile, "utf8"));
  } catch (e) {
    console.info(`Could not read ${configFile} file. Using no tools.`);
  }
  if (toolConfig) {
    tools.push(...(await createTools(toolConfig)));
  }

  const agent = new LLMAgent({
    tools,
    systemPrompt: process.env.SYSTEM_PROMPT,
  }) as unknown as BaseChatEngine;

  return agent;
}

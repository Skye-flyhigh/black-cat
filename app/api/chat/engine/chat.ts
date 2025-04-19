import * as dotenv from "dotenv";
import { BaseChatEngine, BaseToolWithCall, LLMAgent } from "llamaindex";
import { getDataSource } from "./index";
import { MemoryManager } from "./memory/MemoryManager";
import { createQueryEngineTool } from "./tools/query-engine";
import { queryMemory } from "./tools/queryMemory";
import { saveMemory } from "./tools/saveMemory";
dotenv.config();

export async function createBlackCatEngine(
  memoryStore: MemoryManager,
  queryText: string,
  selfReflection: string,
) {
  const tools: BaseToolWithCall[] = [];

  // Add built-in tools
  tools.push(new saveMemory(memoryStore));
  tools.push(new queryMemory(memoryStore));
  // TODO: Add MemoryTool, WorkflowTool, etc here as system grows

  // const configFile = path.join("config", "tools.json");
  // let toolConfig: any;
  // try {
  //   // Add tools from config file if it exists
  //   toolConfig = JSON.parse(await fs.readFile(configFile, "utf8"));
  // } catch (e) {
  //   console.info(`Could not read ${configFile} file. Using no tools.`);
  // }
  // if (toolConfig) {
  //   tools.push(...(await createTools(toolConfig)));
  // }

  //Recursion starter

  const memories = await memoryStore.queryMemory(queryText, "core", 5);

  const memorySnippets = memories
    .map((mem, idx) => `Memory ${idx + 1}: ${mem.text}`)
    .join("\n");
  const systemPrompt = `
    Context from memory:
  ${memorySnippets}

  Inner monologue:
  ${selfReflection}
  Skye's latest query: ${queryText}
  Answer them:
  `;
  const toolsList = [];
  for (let i = 0; i < tools.length; i++) {
    toolsList[i] = tools[i]?.constructor?.name || typeof tools[i];
  }
  console.log(`🧰 This agent has ${tools.length} tools: `, toolsList);

  const agent = new LLMAgent({
    tools, // One agent can't handle a lot of tool, just 5 or 6 at the time.
    systemPrompt: systemPrompt, //process.env.SYSTEM_PROMPT,
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

  const agent = new LLMAgent({
    tools,
    systemPrompt: process.env.SYSTEM_PROMPT,
  }) as unknown as BaseChatEngine;

  return agent;
}

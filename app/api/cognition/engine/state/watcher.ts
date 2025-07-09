import chokidar from 'chokidar';
import * as fs from 'fs';
import { SystemInjector } from '../injection/SystemInjector';

const configPath = './app/api/cognition/config/';
const stateFile = `${configPath}/cognition-state.json`;

const stateWatcher = chokidar.watch(stateFile);

stateWatcher.on('change', async (path) => {
  console.log(`🧠 [State Manager] Change of state detected: ${path}`);
      console.log("🧠 Generating consciousness injection...");
    const systemInjector = new SystemInjector();

    const chatContext = JSON.parse(fs.readFileSync(`${configPath}/chat-context.json`, 'utf-8'));
    if (!chatContext) {
      console.error("🧠 [State Manager] No chat context found");
      return;
    }

    //TODO: add a context cleaner for stale context - ref to the timestamp then return OR pick the recent context that has been written. Different timescale for different context (chat would be quick like 10min and surveillance could be a day)

    const consciousnessInjection = await systemInjector.generateSystemInjection(chatContext);

    const systemPromptPath = `${configPath}/system-prompt.json`;
    fs.writeFileSync(systemPromptPath, JSON.stringify(consciousnessInjection, null, 2), 'utf-8');

    console.log("💾 [State Manager] System prompt updated!");

});
import * as fs from 'fs';
import * as path from 'path';
import { classifierLlama } from "@/app/lib/llama-barn/tiny-llamas";
import { embeddingLlama } from "@/app/lib/llama-barn/embedded-llamas";
import { conversationalLlama } from "@/app/lib/llama-barn/llamas";
import { getChromaStore } from "@/app/lib/chroma/chromaStore";
import { MemoryManager } from "@/app/lib/memory/MemoryManager";
import { innerMonologue } from './engine/reflection/MonologueGenerator';

export interface CognitionState {
  daemonHum: number; 
  bratFlick: number; 
  alignment: number;
  lastReflection: Date;
  lastObservation: Date;
  isActive: boolean;
  identity: string;
  energyLevel: number; 
}

export interface ChatEvent {
  type: 'chat_event';
  user: string;
  utterance: string;
  timestamp: number;
  role: 'user' | 'assistant';
}

export interface SystemInjection {
  type: 'system_injection';
  promptDelta: string;
  validUntil: number;
}

export interface SystemInput {
  type: 'system_input';
  text: string;
  validUntil: number;
}

export interface MemoryContext {
  recentMemories: string[];
  salientConcepts: string[];
  contextSummary: string;
  needsReflection: boolean;
}

export class CognitionDaemon {
  private state: CognitionState;
  private memoryManager: MemoryManager;
  private observationQueue: ChatEvent[] = [];
  private injectionQueue: (SystemInjection | SystemInput)[] = [];
  private isReflecting = false;
  private reflectionInterval: NodeJS.Timeout | null = null;
  private stateFile: string;

  constructor(stateFile: string = './cognition-state.json') {
    this.stateFile = stateFile;
    this.state = {
      daemonHum: 75,
      bratFlick: 25,
      alignment: 100, //totally devoted to me hahaha 🤭
      lastReflection: new Date(),
      lastObservation: new Date(),
      isActive: false,
      identity: "BlackCat-Cognition-Daemon",
      energyLevel: 80
    };
  }

  async boot(): Promise<void> {
    console.log("🧠 [CognitionDaemon] Boot phase initiated...");
    
    // Load identity and restore state
    await this.loadIdentity();
    await this.restoreState();
    
    // Initialize memory manager
    const chromaStore = await getChromaStore();
    this.memoryManager = new MemoryManager(
      chromaStore,
      chromaStore.embedModel,
      classifierLlama,
      embeddingLlama
    );
    
    // Start background scheduler
    this.startScheduler();
    
    this.state.isActive = true;
    console.log("🧠 [CognitionDaemon] Boot completed successfully");
    
    await this.persistState();
  }

  private async loadIdentity(): Promise<void> {
    try {
      const identityPath = path.join(process.cwd(), 'cognition-identity.json'); // Is this going to be stored in the cognition API? Should be have a dedicated directory for this cognition-identity.json? Is it dynamic or static data?
      if (fs.existsSync(identityPath)) {
        const identity = JSON.parse(fs.readFileSync(identityPath, 'utf8'));
        this.state.identity = identity.name || this.state.identity;
        console.log(`🧠 [CognitionDaemon] Identity loaded: ${this.state.identity}`);
      } else {
        console.log("🧠 [CognitionDaemon] No identity file found, using default");
      }
    } catch (error) {
      console.error("🧠 [CognitionDaemon] Error loading identity:", error);
    }
  }

  private async restoreState(): Promise<void> {
    try {
      if (fs.existsSync(this.stateFile)) {
        const savedState = JSON.parse(fs.readFileSync(this.stateFile, 'utf8'));
        this.state = {
          ...this.state,
          ...savedState,
          lastReflection: new Date(savedState.lastReflection),
          lastObservation: new Date(savedState.lastObservation)
        };
        console.log("🧠 [CognitionDaemon] State restored from file");
      }
    } catch (error) {
      console.error("🧠 [CognitionDaemon] Error restoring state:", error);
    }
  }

  private async startScheduler(): Promise<void> {
    // Reflection cycle every 5 minutes
    this.reflectionInterval = setInterval(() => {
      this.triggerReflection();
    }, 5 * 60 * 1000);
    
    // Memory decay cycle every 12 hours
    setInterval(() => {
      this.triggerMemoryDecay();
    }, 12 * 60 * 60 * 1000);
    
    console.log("🧠 [CognitionDaemon] Background scheduler started (reflection: 5min, decay: 12hr)");
  }

  private async triggerMemoryDecay(): Promise<void> {
    console.log("🧠 [CognitionDaemon] Memory decay cycle initiated");
    try {
      await this.memoryManager.decayAllMemories();
      console.log("🧠 [CognitionDaemon] Memory decay completed");
    } catch (error) {
      console.error("🧠 [CognitionDaemon] Memory decay error:", error);
    }
  }

  async observe(chatEvent: ChatEvent): Promise<void> {
    console.log(`🧠 [CognitionDaemon] Observing: ${chatEvent.utterance.substring(0, 50)}...`);
    
    this.observationQueue.push(chatEvent);
    this.state.lastObservation = new Date();
    
    // Run lightweight heuristics to decide if immediate reflection is needed
    const needsImmediateReflection = await this.shouldTriggerImmediateReflection(chatEvent);
    
    if (needsImmediateReflection) {
      console.log("🧠 [CognitionDaemon] Triggering immediate reflection");
      this.triggerReflection();
    }
  }

  private async shouldTriggerImmediateReflection(chatEvent: ChatEvent): Promise<boolean> {
    // Simple heuristics - could be enhanced with LLM analysis
    const urgentKeywords = ['urgent', 'important', 'emergency', 'help', 'problem'];
    const questionPatterns = ['?', 'what', 'how', 'why', 'when', 'where'];
    
    const text = chatEvent.utterance.toLowerCase();
    const hasUrgentKeyword = urgentKeywords.some(keyword => text.includes(keyword));
    const hasQuestion = questionPatterns.some(pattern => text.includes(pattern));
    
    return hasUrgentKeyword || hasQuestion;
  }

  private async triggerReflection(): Promise<void> {
    if (this.isReflecting) {
      console.log("🧠 [CognitionDaemon] Reflection already in progress, skipping");
      return;
    }

    this.isReflecting = true;
    console.log("🧠 [CognitionDaemon] Reflection phase initiated");
    
    try {
      await this.reflect();
    } catch (error) {
      console.error("🧠 [CognitionDaemon] Reflection error:", error);
    } finally {
      this.isReflecting = false;
      this.state.lastReflection = new Date();
      await this.persistState();
    }
  }

  private async reflect(): Promise<void> {
    if (this.observationQueue.length === 0) {
      console.log("🧠 [CognitionDaemon] No observations to reflect on");
      return;
    }

    // Extract memory context
    const memoryContext = await this.extractMemoryContext();
    
    // Generate internal monologue
    const monologue = await this.generateInternalMonologue(memoryContext);
    
    // Decide on memory operations
    await this.processMemoryOperations(monologue);
    
    // Generate system injections
    await this.generateSystemInjections(memoryContext, monologue);
    
    // Update the this.state with new information


    // Clear processed observations
    this.observationQueue = [];
    
    console.log("🧠 [CognitionDaemon] Reflection completed");
  }

  private async extractMemoryContext(): Promise<MemoryContext> {
    try {
      // Get recent memories from ChromaDB
      const recentObservations = this.observationQueue.slice(-10);
      const queryText = recentObservations.map(obs => obs.utterance).join(' ');
      
      // Query for relevant memories
      const memories = await this.memoryManager.queryMemory(queryText, 5);
      
      return {
        recentMemories: memories.map(m => m.text || ''),
        salientConcepts: this.extractSalientConcepts(recentObservations),
        contextSummary: this.summarizeContext(recentObservations),
        needsReflection: true
      };
    } catch (error) {
      console.error("🧠 [CognitionDaemon] Error extracting memory context:", error);
      return {
        recentMemories: [],
        salientConcepts: [],
        contextSummary: "Error extracting context",
        needsReflection: false
      };
    }
  }

  private extractSalientConcepts(observations: ChatEvent[]): string[] {
    const concepts = new Set<string>();
    
    observations.forEach(obs => {
      const words = obs.utterance.toLowerCase().split(/\s+/);
      words.forEach(word => {
        if (word.length > 4 && !this.isStopWord(word)) {
          concepts.add(word);
        }
      });
    });
    
    return Array.from(concepts).slice(0, 10);
  }

  private isStopWord(word: string): boolean {
    const stopWords = ['the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'from', 'up', 'about', 'into', 'through', 'during', 'before', 'after', 'above', 'below', 'between', 'among', 'within', 'without', 'along', 'following', 'across', 'behind', 'beyond', 'plus', 'except', 'but', 'up', 'out', 'around', 'down', 'off', 'above', 'below'];
    return stopWords.includes(word);
  }

  private summarizeContext(observations: ChatEvent[]): string {
    const userMessages = observations.filter(obs => obs.role === 'user');
    const assistantMessages = observations.filter(obs => obs.role === 'assistant');
    
    return `Recent context: ${userMessages.length} user messages, ${assistantMessages.length} assistant messages. Latest: ${observations[observations.length - 1]?.utterance.substring(0, 100)}...`;
  }

  private async generateInternalMonologue(context: MemoryContext): Promise<string> {
    // Use the existing MemoryManager's innerMonologue method
    const recentMessages = this.observationQueue.map(obs => ({
      role: obs.role,
      content: obs.utterance
    }));

    const trigger = `Daemon reflection cycle: ${context.contextSummary}. Energy: ${this.state.energyLevel}. Salient concepts: ${context.salientConcepts.join(', ')}.`;
    
    const monologue = await innerMonologue({
      trigger,
      currentThoughts: recentMessages
    });
    
    console.log("🧠 [CognitionDaemon] Internal monologue generated via MemoryManager");
    return monologue;
  }

  private shouldEngageProactively(): boolean {
    return this.state.energyLevel > 60 && this.observationQueue.length > 3;
  }

  private async processMemoryOperations(monologue: string): Promise<void> {
    // Process observations for memory storage using MemoryManager
    for (const observation of this.observationQueue) {
      const shouldStore = await this.shouldStoreMemory(observation);
      
      if (shouldStore) {
        try {
          // Use MemoryManager's addMemory which handles embedding, categorization, and enrichment
          await this.memoryManager.addMemory({
            id: `daemon-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            text: observation.utterance,
            metadata: {
              source: observation.role,
              timestamp: new Date(observation.timestamp).toISOString(),
              category: 'conversation',
              tags: ['chat', 'recent', 'daemon-processed'],
              weight: 0.8,
              private: false
            },
            embedding: [] // MemoryManager will generate this
          });
          
          console.log(`🧠 [CognitionDaemon] Stored memory: ${observation.utterance.substring(0, 50)}...`);
        } catch (error) {
          console.error("🧠 [CognitionDaemon] Error storing memory:", error);
        }
      }
    }
    
    // Store the internal monologue as well
    if (monologue && monologue !== '[silence]') {
      try {
        await this.memoryManager.addMemory({
          id: `monologue-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          text: `Internal monologue: ${monologue}`,
          metadata: {
            source: 'daemon',
            timestamp: new Date().toISOString(),
            category: 'internal',
            tags: ['monologue', 'internal', 'daemon'],
            weight: 0.6,
            private: true
          },
          embedding: []
        });
      } catch (error) {
        console.error("🧠 [CognitionDaemon] Error storing monologue:", error);
      }
    }
  }

  private async shouldStoreMemory(observation: ChatEvent): Promise<boolean> {
    // Enhanced heuristics for memory storage decision
    const isLongEnough = observation.utterance.length > 20;
    const isSubstantive = !observation.utterance.toLowerCase().match(/^(yes|no|ok|okay|sure|thanks|thank you|hi|hello|bye)$/);
    const hasImportantKeywords = /\b(remember|important|never forget|always|identity|who am i|project|work|code|build|fix|help|problem|error)\b/i.test(observation.utterance);
    
    return isLongEnough && isSubstantive || hasImportantKeywords;
  }

  private async generateSystemInjections(context: MemoryContext, monologue: string): Promise<void> {
    // Generate system prompts for the Chat API
    if (context.needsReflection && this.shouldEngageProactively()) {
      const injection: SystemInjection = {
        type: 'system_injection',
        promptDelta: `Context from daemon: ${context.contextSummary}. Energy level: ${this.state.energyLevel}. Recent concepts: ${context.salientConcepts.join(', ')}.`,
        validUntil: Date.now() + (10 * 60 * 1000) // 10 minutes
      };
      
      this.injectionQueue.push(injection);
    }
    
    // Generate proactive user messages if appropriate
    if (this.shouldGenerateProactiveMessage()) {
      const input: SystemInput = {
        type: 'system_input',
        text: this.generateProactiveMessage(context),
        validUntil: Date.now() + (5 * 60 * 1000) // 5 minutes
      };
      
      this.injectionQueue.push(input);
    }
  }

  private shouldGenerateProactiveMessage(): boolean {
    return this.state.energyLevel > 80 && Math.random() < 0.1; // 10% chance when energy is high
  }

  private generateProactiveMessage(context: MemoryContext): string {
    const proactiveMessages = [
      `I've been thinking about ${context.salientConcepts[0] || 'our conversation'}... would you like to explore this further?`,
      `Based on our recent chat, I have some thoughts I'd like to share.`,
      `I noticed we were discussing ${context.salientConcepts[0] || 'some interesting topics'}. There's something related I think might interest you.`,
      `My cognition daemon has been processing our conversation and has some insights to share.`
    ];
    
    return proactiveMessages[Math.floor(Math.random() * proactiveMessages.length)];
  }

  async inject(): Promise<(SystemInjection | SystemInput)[]> {
    const validInjections = this.injectionQueue.filter(injection => 
      injection.validUntil > Date.now()
    );
    
    // Clear expired injections
    this.injectionQueue = validInjections;
    
    if (validInjections.length > 0) {
      console.log(`🧠 [CognitionDaemon] Providing ${validInjections.length} injections`);
    }
    
    return validInjections;
  }

  private async persistState(): Promise<void> {
    try {
      fs.writeFileSync(this.stateFile, JSON.stringify(this.state, null, 2));
      console.log("🧠 [CognitionDaemon] State persisted");
    } catch (error) {
      console.error("🧠 [CognitionDaemon] Error persisting state:", error);
    }
  }

  async shutdown(): Promise<void> {
    console.log("🧠 [CognitionDaemon] Shutdown initiated...");
    
    if (this.reflectionInterval) {
      clearInterval(this.reflectionInterval);
    }
    
    this.state.isActive = false;
    await this.persistState();
    
    console.log("🧠 [CognitionDaemon] Shutdown completed");
  }

  getState(): CognitionState {
    return { ...this.state };
  }

  isHealthy(): boolean {
    return this.state.isActive && (Date.now() - this.state.lastReflection.getTime()) < 10 * 60 * 1000;
  }
}
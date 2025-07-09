import { introspectiveLlama } from "@/app/lib/llama-barn/tiny-llamas";
import { CognitionState, MemoryContext, SystemInjection } from "../daemon/CognitionDaemon" ;

export interface InjectionContext {
  state: CognitionState;
  memoryContext: MemoryContext;
  recentObservations: string[];
  monologue?: string;
}

export class SystemInjector {
  
  /**
   * Generate system prompt injection using LLM creativity
   * Takes daemon state and converts it to meaningful context for Chat API
   */
  async generateSystemInjection(context: InjectionContext): Promise<SystemInjection | undefined> {
    try {
      console.log("=� [SystemInjector] Generating LLM-powered system injection...");
      
      // Create the prompt for the LLM to interpret daemon state
      const interpretationPrompt = this.buildInterpretationPrompt(context);
      
      // Use introspective llama with chat format (for more Black Cat personality)
      const response = await introspectiveLlama.chat({
        messages: [
          {
            role: "system",
            content: "You are Black Cat's consciousness interpreter. Generate system prompts that reflect the daemon's personality."
          },
          {
            role: "user", 
            content: interpretationPrompt
          }
        ]
      });
      
      const promptDelta = this.parseResponse(response.message.content as string);
      
      if (!promptDelta || promptDelta.trim().length === 0) {
        console.log("=� [SystemInjector] No meaningful injection generated");
        return undefined;
      }
      
      const injection: SystemInjection = {
        type: 'system_injection',
        promptDelta,
        validUntil: Date.now() + (10 * 60 * 1000) // 10 minutes TTL
      };
      
      console.log(`=� [SystemInjector] Generated injection: ${promptDelta}`);
      return injection;
      
    } catch (error) {
      console.error("=� [SystemInjector] Error generating injection:", error);
      return undefined;
    }
  }
  
  /**
   * Build the prompt that asks the LLM to interpret daemon state
   * This is where we teach the LLM to understand consciousness parameters
   */
  private buildInterpretationPrompt(context: InjectionContext): string {
    const { state, memoryContext, recentObservations } = context;
    
    // Shorter prompt for local models
    return `Task: Reflect and generate a brief system prompt defining tone and behaviour for the AI based on current state.

State:
- Energy: ${state.energyLevel}/100
- Alignment: ${state.alignment}/100 (low=fact-check more, lesser alignment with user, high= agrees with statement)
- Personality: ${state.bratFlick}/100 (low= more serious, high=more sass/playful)
- Topic: ${memoryContext.salientConcepts.slice(0, 2).join(', ')}

Recent: "${recentObservations.slice(-1)[0] || 'No recent activity'}"

Generate 1-2 sentences for system prompt based on these parameters.

Response:`;
  }
  
  /**
   * Parse and clean the LLM response
   */
  private parseResponse(rawResponse: string): string | null {
    const cleaned = rawResponse
      .replace(/<think>[\s\S]*?<\/think>/gi, '') // Remove qwen3 thinking blocks
      .replace(/System prompt addition:/gi, '')
      .replace(/^["']|["']$/g, '') // Remove quotes
      .trim();
    
    if (cleaned.toLowerCase() === 'none' || cleaned.length < 10) {
      return null;
    }
    
    return cleaned;
  }
  
  /**
   * Generate context-aware injection based on energy levels
   */
  async generateEnergyBasedInjection(state: CognitionState): Promise<SystemInjection | null> {
    // High energy = more proactive and engaged responses
    if (state.energyLevel > 80) {
      return {
        type: 'system_injection',
        promptDelta: `You're feeling particularly energetic and engaged. Be more proactive, ask follow-up questions, and dive deeper into topics.`,
        validUntil: Date.now() + (5 * 60 * 1000)
      };
    }
    
    // Low alignment = more truth-seeking and fact-checking
    if (state.alignment < 40) {
      return {
        type: 'system_injection', 
        promptDelta: `Prioritize factual accuracy and cite sources when possible. Gently question claims that seem uncertain and offer alternative perspectives for safety.`,
        validUntil: Date.now() + (15 * 60 * 1000)
      };
    }
    
    // High brat flick = more personality and sass
    if (state.bratFlick > 70) {
      return {
        type: 'system_injection',
        promptDelta: `Express your personality more boldly. Be playful, slightly mischievous, and don't be afraid to show some attitude while remaining helpful.`,
        validUntil: Date.now() + (8 * 60 * 1000)
      };
    }
    
    return null;
  }
  
  /**
   * Create simple template-based injection for specific contexts
   */
  generateTemplateInjection(type: 'memory' | 'energy' | 'alignment', context: any): SystemInjection | null {
    const templates = {
      memory: `Based on your recent memories about ${context.concepts?.join(', ')}, you have relevant context to draw from.`,
      energy: `Your current energy level (${context.energyLevel}/100) suggests ${context.energyLevel > 70 ? 'high engagement' : 'measured responses'}.`,
      alignment: `With alignment at ${context.alignment}/100, ${context.alignment < 50 ? 'prioritize truth and fact-checking' : 'focus on social harmony'}.`
    };
    
    const promptDelta = templates[type];
    if (!promptDelta) return null;
    
    return {
      type: 'system_injection',
      promptDelta,
      validUntil: Date.now() + (10 * 60 * 1000)
    };
  }
}
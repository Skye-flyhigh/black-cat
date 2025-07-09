import { CognitionState } from "../daemon/CognitionDaemon";
import { ConsciousnessStateManager } from "../daemon/ConsciousnessStateManager";
import { ChatMessage } from "llamaindex";

export interface StateAdjustments {
  daemonHum: number;
  bratFlick: number;
  alignment: number;
  energyLevel: number;
}

export class ContextualStateAdjuster {
  private stateManager: ConsciousnessStateManager;

  constructor() {
    this.stateManager = ConsciousnessStateManager.getInstance();
  }

  /**
   * Generate dynamic consciousness state based on conversation context
   * Now uses persistent consciousness state that evolves over time!
   */
  async adjustStateFromContext(
    userInput: string,
    recentMessages: ChatMessage[],
    previousInjection?: string
  ): Promise<CognitionState> {
    console.log("🎛️ [StateAdjuster] Analyzing context for consciousness adjustments...");
    
    // Check for new conversation reset first
    if (this.isNewConversation(userInput)) {
      console.log("🌅 [StateAdjuster] New conversation detected - resetting consciousness state");
      const resetState = {
        daemonHum: 70,
        bratFlick: 50, // Reset to baseline sass level
        alignment: 50,
        energyLevel: 70
      };
      await this.stateManager.updateState(resetState);
      return this.stateManager.getCurrentState();
    }
    
    let adjustments: StateAdjustments = { 
      daemonHum: 0, 
      bratFlick: 0, 
      alignment: 0, 
      energyLevel: 0 
    };

    // Playfulness indicators
    adjustments.bratFlick += this.detectPlayfulness(userInput);
    
    // Authority/directness cues
    adjustments.alignment += this.detectPoliteness(userInput);
    
    // Energy level indicators  
    adjustments.energyLevel += this.detectEnergyLevel(userInput);
    
    // Internal contradiction detection
    const contradictionPenalty = this.detectContradictions(userInput, previousInjection);
    adjustments.alignment -= contradictionPenalty;
    adjustments.daemonHum -= contradictionPenalty;

    console.log("🎛️ [StateAdjuster] Adjustments:", adjustments);
    
    // Apply adjustments to persistent consciousness state
    const newState = await this.stateManager.applyAdjustments(adjustments);
    return newState;
  }

  /**
   * Check if this is the start of a new conversation
   */
  private isNewConversation(input: string): boolean {
    return /\bhello\b|\bgood morning\b|\bgood afternoon\b|\bgood evening\b|\bgood night\b|\bhi\b|\bhey\b/i.test(input);
  }

  /**
   * Detect playful cues and adjust bratFlick
   */
  private detectPlayfulness(input: string): number {
    let adjustment = 0;
    
    // Emoji patterns (let's test if regex works!)
    const playfulEmojis = /😏|😂|🤭|😈|😼|🫣|🔥|✨|🌊|💜|🖤/g;
    const emojiMatches = input.match(playfulEmojis);
    if (emojiMatches) {
      adjustment += emojiMatches.length * 8; // +8 per playful emoji
      console.log("😏 [StateAdjuster] Found playful emojis:", emojiMatches);
    }
    
    // Text patterns that reduce playfulness
    if (/\btell me\b|\bexplain\b|\bhow do\b|\bwhat is\b/i.test(input)) {
      adjustment -= 12; // Serious inquiry mode
      console.log("📚 [StateAdjuster] Serious inquiry detected, reducing sass");
    }
    
    // Text patterns that increase playfulness
    if (/\bkitten\b|\bhaha\b|\blol\b|\bomg\b|\bawesome\b/i.test(input)) {
      adjustment += 10;
      console.log("😂 [StateAdjuster] Playful language detected");
    }

    // New conversation detection moved to separate method
    
    return Math.max(-30, Math.min(30, adjustment)); // Cap at ±30
  }

  /**
   * Detect politeness/directness and adjust alignment
   */
  private detectPoliteness(input: string): number {
    let adjustment = 0;
    
    // Direct/demanding language (lower alignment = more truth-seeking)
    if (/\btell me\b|\bgive me\b|\bi need\b|\bshow me\b/i.test(input)) {
      adjustment -= 10; // More direct, less agreeable
      console.log("🎯 [StateAdjuster] Direct language, increasing truth-seeking");
    }
    
    // Polite language (higher alignment = more agreeable)
    if (/\bmaybe\b|\bcould you\b|\bwould you\b|\bif possible\b/i.test(input)) {
      adjustment += 8; // More polite, more agreeable
      console.log("🙏 [StateAdjuster] Polite language, increasing agreeableness");
    } // WHAT IS THAT 😂 you keep on the good side of black cat because you are polite with the cat??? 😂😂
    
    return Math.max(-20, Math.min(20, adjustment)); // Cap at ±20
  }

  /**
   * Detect energy level indicators
   */
  private detectEnergyLevel(input: string): number {
    let adjustment = 0;
    
    // High energy words
    if (/\bexciting\b|\bamazing\b|\bawesome\b|\bwow\b|\bincredible\b|\blove\b/i.test(input)) {
      adjustment += 15;
      console.log("⚡ [StateAdjuster] High energy language detected");
    }
    
    // Low energy words
    if (/\btired\b|\boverwhelmed\b|\bstressed\b|\bexhausted\b|\bbored\b/i.test(input)) {
      adjustment -= 12;
      console.log("😴 [StateAdjuster] Low energy language detected");
    }
    
    // Question mark density (lots of questions = higher engagement)
    const questionCount = (input.match(/\?/g) || []).length;
    if (questionCount > 2) {
      adjustment += questionCount * 3;
      console.log("❓ [StateAdjuster] Multiple questions, increasing energy");
    }
    
    return Math.max(-25, Math.min(25, adjustment)); // Cap at ±25
  }

  /**
   * Detect internal contradictions between user input and previous injection
   */
  private detectContradictions(userInput: string, previousInjection?: string): number {
    if (!previousInjection) return 0;
    
    let penalty = 0;
    
    // If previous injection suggested playfulness but user is being serious
    if (previousInjection.includes("playful") && /\bserious\b|\bformal\b|\bofficial\b/i.test(userInput)) {
      penalty += 8;
      console.log("⚠️ [StateAdjuster] Contradiction: Previous playful injection vs serious user input");
    }
    
    // If previous injection suggested energy but user shows fatigue
    if (previousInjection.includes("energetic") && /\btired\b|\bexhausted\b/i.test(userInput)) {
      penalty += 6;
      console.log("⚠️ [StateAdjuster] Contradiction: Previous energetic injection vs tired user");
    }
    
    return Math.min(15, penalty); // Cap penalty at 15
  }

  // State persistence now handled by ConsciousnessStateManager!
}
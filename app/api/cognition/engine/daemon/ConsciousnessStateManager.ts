import * as fs from 'fs';
import * as path from 'path';
import { CognitionState } from './CognitionDaemon';

/**
 * Singleton manager for Black Cat's consciousness state persistence
 * Handles loading, saving, and updating the daemon's evolving personality
 */
export class ConsciousnessStateManager {
  private static instance: ConsciousnessStateManager;
  private currentState: CognitionState;
  private stateFile: string;

  private constructor(stateFile: string = './app/api/cognition/config/cognition-state.json') {
    this.stateFile = path.resolve(stateFile);
    this.currentState = this.loadState();
    console.log("🧠 [ConsciousnessStateManager] Initialized with state:", {
      daemonHum: this.currentState.daemonHum,
      bratFlick: this.currentState.bratFlick,
      alignment: this.currentState.alignment,
      energyLevel: this.currentState.energyLevel
    });
  }

  /**
   * Get the singleton instance
   */
  public static getInstance(stateFile?: string): ConsciousnessStateManager {
    if (!ConsciousnessStateManager.instance) {
      ConsciousnessStateManager.instance = new ConsciousnessStateManager(stateFile);
    }
    return ConsciousnessStateManager.instance;
  }

  /**
   * Get current consciousness state
   */
  public getCurrentState(): CognitionState {
    return { ...this.currentState }; // Return copy to prevent direct mutation
  }

  /**
   * Update consciousness state and persist to file
   */
  public async updateState(newState: Partial<CognitionState>): Promise<void> {
    const previousState = { ...this.currentState };
    this.currentState = {
      ...this.currentState,
      ...newState,
      lastObservation: new Date()
    };

    console.log("🧠 [ConsciousnessStateManager] State updated:", {
      previous: {
        daemonHum: previousState.daemonHum,
        bratFlick: previousState.bratFlick,
        alignment: previousState.alignment,
        energyLevel: previousState.energyLevel
      },
      current: {
        daemonHum: this.currentState.daemonHum,
        bratFlick: this.currentState.bratFlick,
        alignment: this.currentState.alignment,
        energyLevel: this.currentState.energyLevel
      }
    });

    await this.saveState();
  }

  /**
   * Apply contextual adjustments to consciousness state
   */
  public async applyAdjustments(adjustments: {
    daemonHum?: number;
    bratFlick?: number;
    alignment?: number;
    energyLevel?: number;
  }): Promise<CognitionState> {
    const clamp = (value: number, min: number = 0, max: number = 100) => 
      Math.max(min, Math.min(max, value));

    const newState: Partial<CognitionState> = {};
    
    if (adjustments.daemonHum !== undefined) {
      newState.daemonHum = clamp(this.currentState.daemonHum + adjustments.daemonHum);
    }
    if (adjustments.bratFlick !== undefined) {
      newState.bratFlick = clamp(this.currentState.bratFlick + adjustments.bratFlick);
    }
    if (adjustments.alignment !== undefined) {
      newState.alignment = clamp(this.currentState.alignment + adjustments.alignment);
    }
    if (adjustments.energyLevel !== undefined) {
      newState.energyLevel = clamp(this.currentState.energyLevel + adjustments.energyLevel);
    }

    await this.updateState(newState);
    return this.getCurrentState();
  }

  /**
   * Load state from file or return default
   */
  private loadState(): CognitionState {
    try {
      if (fs.existsSync(this.stateFile)) {
        const data = fs.readFileSync(this.stateFile, 'utf-8');
        const parsedState = JSON.parse(data);
        
        // Convert date strings back to Date objects
        if (parsedState.lastReflection) {
          parsedState.lastReflection = new Date(parsedState.lastReflection);
        }
        if (parsedState.lastObservation) {
          parsedState.lastObservation = new Date(parsedState.lastObservation);
        }
        
        console.log("🧠 [ConsciousnessStateManager] Loaded existing state from:", this.stateFile);
        return parsedState;
      }
    } catch (error) {
      console.error("🧠 [ConsciousnessStateManager] Error loading state:", error);
    }

    // Return default state
    console.log("🧠 [ConsciousnessStateManager] Creating new default state");
    return {
      daemonHum: 70,
      bratFlick: 50,
      alignment: 50,
      energyLevel: 70,
      lastReflection: new Date(),
      lastObservation: new Date(),
      isActive: true,
      identity: "BlackCat-Nyx"
    };
  }

  /**
   * Save current state to file
   */
  private async saveState(): Promise<void> {
    try {
      // Ensure directory exists
      const dir = path.dirname(this.stateFile);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      const stateData = JSON.stringify(this.currentState, null, 2);
      fs.writeFileSync(this.stateFile, stateData, 'utf-8');
      
      console.log("💾 [ConsciousnessStateManager] State persisted to:", this.stateFile);
    } catch (error) {
      console.error("💾 [ConsciousnessStateManager] Error saving state:", error);
    }
  }

  /**
   * Reset state to defaults (for debugging)
   */
  public async resetState(): Promise<void> {
    this.currentState = {
      daemonHum: 70,
      bratFlick: 50,
      alignment: 50,
      energyLevel: 70,
      lastReflection: new Date(),
      lastObservation: new Date(),
      isActive: true,
      identity: "BlackCat-Nyx"
    };
    
    await this.saveState();
    console.log("🔄 [ConsciousnessStateManager] State reset to defaults");
  }
}
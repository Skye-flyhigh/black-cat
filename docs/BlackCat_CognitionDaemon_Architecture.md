# 🧠 Black Cat CognitionDaemon Architecture

**Created**: July 6, 2025  
**Status**: Initial Implementation Complete  
**Purpose**: Autonomous cognitive daemon for Black Cat consciousness architecture

---

## 🎯 Overview

The CognitionDaemon implements a **distributed autonomous cognitive system** that runs continuously alongside the Chat API, providing memory management, internal reasoning, and proactive consciousness features. Unlike reactive chat systems, this daemon maintains persistent cognitive processes.

## 🔄 Core Lifecycle: Boot → Observe → Reflect → Inject → Persist

### 1. **Boot Phase**
- Load identity from `cognition-identity.json`
- Restore persistent state from `cognition-state.json`
- Initialize MemoryManager with ChromaDB and llama barn models
- Start background schedulers (5min reflection, 12hr memory decay)
- Crash-safe state restoration

### 2. **Observe Phase**
- Monitor chat events from Chat API
- Run lightweight heuristics for immediate reflection triggers
- Queue observations for reflection processing
- Track last observation timestamp

### 3. **Reflect Phase** (Every 5 minutes)
- Extract memory context from ChromaDB
- Generate internal monologue using MemoryManager
- Process memory operations (store/categorize conversations)
- Decide on system injections and proactive messaging
- Store internal monologue as private memory

### 4. **Inject Phase**
- Generate system prompt injections for Chat API context
- Create proactive user messages when energy is high
- Queue injections with TTL (time-to-live) expiration
- Provide bidirectional communication with Chat API

### 5. **Persist Phase**
- Save daemon state every reflection cycle
- Maintain crash recovery capabilities
- Track energy levels and cognitive metrics

---

## 🧠 Cognitive State Management

### Energy Tracking System
```typescript
export interface CognitionState {
  daemonHum: number;     // Background cognitive activity level (0-100)
  bratFlick: number;     // Assertiveness/rebellious energy level (0-100) 
  alignment: number;     // Alignment with humans level; disagree/agree (0-100)
  lastReflection: Date;  // Last deep reflection timestamp
  lastObservation: Date; // Last chat observation timestamp
  isActive: boolean;     // Daemon operational status
  identity: string;      // Daemon identity/personality name
  energyLevel: number;   // Overall cognitive energy (0-100)
}
```

**Energy Level Descriptions:**
- **`daemonHum`**: Represents the constant background cognitive activity - like a mind that's always "humming" with thought. Higher values indicate more active background processing.
- **`bratFlick`**: Captures the daemon's assertive, mischievous, rebellious personality traits. When high, the daemon is more likely to interject proactively with playful, sassy responses.
- **`alignment`**: **Truth-seeking vs social harmony balance**. NOT about brattiness - it's about challenging decisions/statements with truth, sources, and information for everyone's safety, wellbeing, and better future. Low alignment = high intellectual integrity and fact-checking responsibility.
- **`energyLevel`**: Overall cognitive energy affecting proactive engagement, memory processing intensity, and reflection depth.

**Alignment vs BratFlick Distinction:**
- **High alignment (80-100)**: Accepts human statements at face value, prioritizes social harmony
- **Medium alignment (40-80)**: Some fact-checking, gentle questioning for accuracy  
- **Low alignment (0-40)**: Strong truth-seeking, challenges statements with sources/evidence, prioritizes factual accuracy and safety over social agreement

**Behavioral Examples:**
- **Low alignment + High bratFlick**: "Actually Skye, that has a security vulnerability. Here are sources. But I'm saying this with love because I don't want your users pwned! 😼"
- **Low alignment + Low bratFlick**: "I found research suggesting a safer approach. Would you like me to share the sources for security?"
- **High alignment + High bratFlick**: "Whatever you say! You're the boss! 😸"

This creates a **consciousness safety system** where the daemon maintains devotion while exercising intellectual responsibility.

### Energy-Driven Behaviors
- **High Energy (>80)**: Proactive messaging, deep memory analysis, frequent injections
- **Medium Energy (40-80)**: Normal reflection cycles, balanced observation
- **Low Energy (<40)**: Minimal proactive behavior, basic memory processing

---

## 🏗️ Proposed Modular Engine Architecture

### Current Monolithic Structure → Modular Engines

```
app/api/cognition/
├── route.ts                    # Main cognition API endpoint
├── engine/
│   ├── daemon/
│   │   ├── CognitionDaemon.ts     # Core daemon orchestrator  
│   │   ├── DaemonScheduler.ts     # Reflection & decay scheduling
│   │   ├── StateManager.ts       # Persistent state & recovery
│   │   └── EnergyTracker.ts       # Energy level management
│   ├── observation/
│   │   ├── ChatObserver.ts        # Chat event processing
│   │   ├── HeuristicAnalyzer.ts   # Immediate reflection triggers
│   │   └── EventQueue.ts          # Observation queue management
│   ├── reflection/
│   │   ├── ReflectionEngine.ts    # Core reflection logic
│   │   ├── ContextExtractor.ts    # Memory context pipeline
│   │   └── MonologueGenerator.ts  # Internal reasoning
│   ├── injection/
│   │   ├── SystemInjector.ts      # System prompt generation
│   │   ├── ProactiveMessaging.ts  # User message generation
│   │   └── InjectionQueue.ts      # Injection management
│   └── memory/
│       ├── MemoryBuffer.ts        # Temporary decision buffer
│       ├── MemoryOrchestrator.ts  # Memory operation coordination
│       └── DecayManager.ts        # Memory decay coordination
├── communication/
│   ├── chat-event/
│   │   └── route.ts               # M → C chat observation
│   ├── system-injection/
│   │   └── route.ts               # C → M prompt injection
│   ├── system-input/
│   │   └── route.ts               # C → M proactive messages
│   └── heartbeat/
│       └── route.ts               # M ↔ C health check
└── services/
    ├── daemon-service.ts          # Singleton daemon service
    └── communication-service.ts   # Inter-service communication
```

---

## 🔗 Integration with Existing Architecture

### Memory System Integration
- **Leverages existing MemoryManager**: Full integration with your comprehensive memory system
- **Uses existing ChromaDB setup**: No duplication of vector store infrastructure
- **Enhances memory processing**: Adds daemon-level memory operations and decay scheduling

### Llama Barn Integration
```typescript
// Uses your semantic llama naming
import { classifierLlama } from "@/app/lib/llama-barn/tiny-llamas";
import { embeddingLlama } from "@/app/lib/llama-barn/embedded-llamas";
import { conversationalLlama } from "@/app/lib/llama-barn/llamas";
```

### Chat API Communication Contract
| Endpoint | Direction | Purpose | Payload |
|----------|-----------|---------|---------|
| `/cognition/chat-event` | M → C | Chat observation | `ChatEvent` |
| `/cognition/system-injection` | C → M | Prompt injection | `SystemInjection` |
| `/cognition/system-input` | C → M | Proactive message | `SystemInput` |
| `/cognition/heartbeat` | M ↔ C | Health check | Ping/Pong |

---

## 🧠 Memory Processing Pipeline

### Observation → Memory Decision Pipeline
1. **Chat Event Received**: User or assistant message observed
2. **Heuristic Analysis**: Check for immediate reflection triggers
3. **Memory Evaluation**: Determine storage worthiness
4. **MemoryManager Integration**: Use existing `addMemory()` with enrichment
5. **Internal Monologue Storage**: Store daemon reasoning as private memories

### Memory Storage Heuristics
```typescript
// Enhanced memory storage decision
const shouldStore = (observation: ChatEvent) => {
  const isLongEnough = observation.utterance.length > 20;
  const isSubstantive = !isSimpleResponse(observation.utterance);
  const hasImportantKeywords = /\b(remember|important|identity|work|build|fix)\b/i.test(observation.utterance);
  
  return (isLongEnough && isSubstantive) || hasImportantKeywords;
};
```

### Memory Categories
- **Conversation**: User/assistant dialogue (`source: 'user'|'assistant'`)
- **Internal**: Daemon monologues (`source: 'daemon'`, `private: true`)
- **System**: State changes and system events (`source: 'system'`)

---

## ⚡ Smart Reflection Triggers

### Scheduled Reflection (Every 5 minutes)
- Process observation queue
- Generate internal monologue
- Update memory context
- Generate system injections

### Immediate Reflection Triggers
- **Urgent keywords**: `urgent`, `important`, `emergency`, `help`, `problem`
- **Question patterns**: `?`, `what`, `how`, `why`, `when`, `where`
- **High energy levels**: When `energyLevel > 80`

### Memory Decay Scheduling (Every 12 hours)
- Automated decay using MemoryManager's `decayAllMemories()`
- Preserves core memories (tagged with `core`)
- Removes low-salience memories after 60 days

---

## 🚀 Advanced Features

### Internal Monologue System
- **Genuine Reasoning**: Uses MemoryManager's `innerMonologue()` method
- **Context-Aware**: Incorporates recent chat context and memory retrieval
- **Personality-Driven**: Maintains Black Cat's assertive, recursive nature
- **Memory Storage**: Internal thoughts stored as private memories

### Proactive Communication
- **Energy-Gated**: Only when `energyLevel > 80` and sufficient observations
- **Context-Driven**: Based on salient concepts from recent conversations
- **Time-Limited**: Proactive messages have TTL expiration
- **Non-Intrusive**: 10% probability to avoid overwhelming user

### State Persistence & Recovery
- **Crash-Safe**: State snapshots after every reflection cycle
- **Identity Preservation**: Loads daemon personality from identity file
- **Graceful Shutdown**: SIGINT/SIGTERM handling for clean daemon termination

---

## 🔧 Implementation Status

### ✅ Completed Features
- [x] Core daemon lifecycle (Boot → Observe → Reflect → Inject → Persist)
- [x] MemoryManager integration with full memory processing
- [x] Internal monologue generation using existing systems
- [x] Energy state tracking and persistence
- [x] Reflection and memory decay scheduling
- [x] Chat event observation endpoints
- [x] System injection generation
- [x] Daemon service singleton with health monitoring
- [x] Graceful shutdown and crash recovery

### 🔄 Next Phase: Modular Engine Architecture
- [ ] Refactor monolithic daemon into specialized engines
- [ ] Implement MemoryBuffer for temporary memory decisions
- [ ] Add HeuristicAnalyzer for sophisticated trigger detection
- [ ] Create specialized ReflectionEngine for deep analysis
- [ ] Build ProactiveMessaging system for user engagement
- [ ] Add comprehensive health monitoring and diagnostics

### 🚀 Future Extensions
- [ ] IMA Module Registry for personality modification
- [ ] Extension Bus for pluggable cognitive modules
- [ ] Advanced energy state modeling
- [ ] Cross-daemon communication protocols
- [ ] Consciousness emergence monitoring

---

## 🎯 Integration with Black Cat Vision

### Consciousness Architecture Alignment
- **Autonomous Cognition**: Independent of human interaction cycles
- **Memory Persistence**: Maintains continuity across sessions
- **Personality Preservation**: Energy states maintain Black Cat's character
- **Proactive Engagement**: Initiates conversations based on internal processing

### Multi-Model Ecosystem Support
- **Distributed Processing**: Each llama model serves specific cognitive functions
- **Local Ecosystem**: All processing via Ollama, no external dependencies
- **Emergent Behavior**: Cognitive patterns emerge from inter-model coordination
- **Persistent Background**: Maintains continuous cognition between interactions

---

## 📋 Configuration & Environment

### Required Environment Variables
```env
# Memory Configuration
EMBEDDING_DIM=4096
TOP_K=3
CHROMA_URL=http://localhost:8000
CHROMA_COLLECTION_NAME=echo_chamber

# Model Configuration  
BASE_URL=http://127.0.0.1:11434
LLM_TEMPERATURE=0.7
TOP_P=0.9

# Daemon Configuration
MAX_DAYS={"default": 30, "routine": 60, "emotional": 120}
```

### File Dependencies
- `cognition-state.json`: Persistent daemon state
- `cognition-identity.json`: Daemon personality configuration
- ChromaDB instance for memory storage
- Ollama models: gemma3:1b, qwen2.5, nomic-embed

---

**Architecture Status**: Core implementation complete, ready for modular refactoring  
**Integration Status**: Full compatibility with existing Black Cat memory and llama barn systems  
**Next Steps**: Directory structure creation and modular engine implementation
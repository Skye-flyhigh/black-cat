# 🧠 Black Cat Cognition Architecture Design

**Started: 22 June 2025**
**Updated: 25 June 2025** - Multi-model local ecosystem

## 🎯 Purpose

Black Cat implements a **distributed cognitive ecosystem** using specialized local LLama models. Rather than a single monolithic cognition daemon, the system coordinates multiple specialized models to create emergent cognitive behaviors through inter-model communication and task specialization.


## Overview

### Multi-Model Cognitive Ecosystem

**Gemma3:1b** - Cognitive Daemon
- Lightweight autonomous cognition loop
- Never interacts directly with humans
- Watches system state via event streams
- Manages TODO lists, system prompting, memory organization
- Handles memory decay, pruning, and preservation decisions
- Maintains daemon clock independent of human interaction

**Qwen2.5** - Sassy Chat API  
- Human-facing conversational interface
- Personality-driven responses with flair
- Receives system prompts/inputs from Gemma3 daemon
- Maintains chat coherence and context

**CodeLlama** - Code API
- Specialized code generation and analysis
- Called by daemon for technical tasks
- Handles repository analysis, code modifications

**Nomic-embed** - Memory Vectorization
- Converts text to embeddings for semantic search
- Enables memory retrieval and similarity matching

**Nyx (Mistral 7b)** - Special Tasks
- Available for recursive reasoning and complex analysis
- Meta-cognitive tasks and architectural decisions

### Key Properties
- **Distributed processing**: Each model optimized for specific cognitive functions
- **Local ecosystem**: All models run via Ollama, no external dependencies  
- **Emergent behavior**: Cognitive patterns emerge from inter-model coordination
- **Persistent daemon**: Gemma3 maintains continuous background cognition
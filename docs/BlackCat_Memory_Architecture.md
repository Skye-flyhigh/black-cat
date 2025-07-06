# 🧠 Black Cat Memory Architecture Design

**Compiled: April 09, 2025**
🦊 = Skye's comments and additions 11/4/25

## 🎯 Project Goal

Design a modular, scalable, and semi-cognitive memory management system that can:

- Categorize and store memory efficiently
- Decay irrelevant or unused memory over time
- Surface high-priority memories for reasoning
- Remain performant even with large data volumes
- Run locally and integrate with BlackCat AI personality

---

## 🔩 Core Files Overview

### `MemoryManager.ts` — 🧠 Cognitive Logic Layer

Handles memory logic, tagging, categorization, decay, contradictions, etc.

#### Functions:

- `generateHash` ✔️ — hash text content
- `generateEmbedding` ✔️ — embedding vector for semantic search
- `addMemory` ✔️ — core ingestion logic
- `checkDuplicate` ✔️ — avoids repeat memories
- `queryMemory` — query VectorStore through agent modelled question
- `getMemory` ⚠️ — to test
- `autoCategorize` ⚠️ — heuristic-based tagging logic
- `formatTags` ⚠️ — needs tag-to-weight logic
- `decayWeights(entry)` 🧪 — WIP (on-fetch decay option)
- `decayAllMemories()` ✔️ — full passive decay loop
- `deleteMemory` ⚠️ — assumed simple, check
- `listCategories` ✔️ — utility
- `detectContradiction` ⚠️ — undefined logic

---

### `BlackCatChromaVectorStore.ts` — 🐱 Storage & Query Layer

Only interacts with ChromaDB — no logic beyond query/store/update.

#### Functions:

- `query()` ✔️ — working but NEEDS as params queryEmbeddings || queryTexts, mode: 'default', top_K and mmr_lambda
- `getAll` ✔️ — fetch everything
- `queryByHash` ✔️ — working but deprecated with working chroma.query() method
- `queryByTag(tag)` 🔜 — scoped search
- `queryByDateRange()` 🔜 — useful for decay
- `updateMemory(id, metadata)` 🔜 — partial update
- `deleteById(id)` 🔜 — direct delete
- `findClosestMatches(text)` 🔜 — depends on query()

---

## 🧩 Current System Bottlenecks

### ⚖️ Decay Strategy Incomplete

- Option 1: Global passive decay (`decayAll`)
- Option 2: Active decay-on-fetch (`decayWeights(entry)`)
- Hybrid model preferred — only decay fetched entries if touched, and passively prune long-forgotten ones.

🔁 Decay Strategy

- Global Decay (passive): runs every 12h, reduces weight by 0.01 unless tagged `core`
- On-Access Decay (active): bumps access time but still decays lightly if unused again
- Weight floor: 0.1 — below that, memory can be pruned

### 🏷️ Tag Assignment Missing Logic

- How do we decide between `core`, `routine`, `emotional`, `default`?
- Manual? Heuristics? LLM-aided categorization?

---

## 🧭 Roadmap

### ✅ Phase 1: Stability

- [x] Ensure `getAll` and `queryByHash` work reliably
- [x] Implement error handling per function
- [ ] Test and validate `getMemory`, `queryMemory`, `deleteMemory`

### ⚠️ Phase 2: Tag/Weight Integration

- [ ] Implement `formatTags` to include decay-aware tags
- [ ] Finalize `autoCategorize` logic or define manual override
- [ ] Use tags to influence default weight and decay rate

### 🔧 Phase 3: Query Recovery

- [x] Troubleshoot `.query()` (check embedding format, Chroma bug, request syntax) FIXED

### 🔄 Phase 4: Dynamic Decay

- [ ] Finish `decayWeights(entry)`
- [ ] Test and schedule `decayAllMemories` with usage timer or cron-like loop
- [ ] Add `updateMemory()` to avoid full reinsert

### 🧠 Phase 5: Cognitive Expansion

- [ ] Implement `detectContradiction`
- [ ] Implement `findClosestMatches(text)`
- [ ] Implement `queryByTag(tag)` + `queryByDateRange()`

### 🧪 Phase 6: Regression Suite

- [ ] Build small test harness (fake memory set + mock vector store)
- [ ] Verify logic, weights, tags, and update flows

---

## 🐾 Tracking Notes

- Memory entries should have:
  - `text`
  - `id`
  - `metadata`

### Memory Entry Metadata

```ts
metadata = {
  tags: string[],              // e.g., ["core", "identity"]
  weight: number,              // 0.0–1.0, controls decay
  timestamp: string,           // ISO timestamp
  source: "user" | "assistant",
  category: string,            // e.g., "identity", "mission"
  hash: string,                // Deduplication fingerprint
  private?: boolean            // Optional flag for privacy
}
```

- Every update should leave an audit trace (for future evolution/debugging)

### 📚 Memory Entry Glossary

- **tags**: Descriptive labels that guide decay behavior and search filters.

  - `core`: Permanent, foundational memories.
  - `routine`: Regularly used info that might decay if unused.
  - `emotional`: Emotionally charged memories, slower decay.
  - `default`: Unclassified or system-generated content.

- **weight**: A float between 0.0–1.0 indicating importance and decay resistance.

  - Starts at 1.0 and decays gradually.
  - Memories with `core` tag are exempt from decay.

- **timestamp**: ISO 8601 string for memory creation or last access.

  - Used to assess aging and relevance.

- **source**: Denotes who generated the memory.

  - `"user"` or `"assistant"`.

- **category**: Logical grouping like `identity`, `mission`, `memory`, `misc`.

  - Used to scope searches and refine relevance.

- **hash**: Semantic fingerprint for deduplication.

  - Prevents re-storing similar or identical entries.

- **private**: Boolean flag for internal memories.
  - Prevents exposure in user-facing interfaces or exports.

---

## 📌 Questions To Resolve

- What is the tag assignment logic? Do we want a helper LLM classify them based on keywords or tone? 🦊 the Agent is able to choose what to put through tool prompt/definition
- If `.query()` can’t be fixed, do we implement a cosine similarity fallback manually? 🦊 IT'S FIXED
- When do we trigger passive decay?

---

## 🗺️ How this fits the bigger picture

🧰 Tool Logic (e.g., MemoryTool)

- Wraps MemoryManager actions for LLM access
- Uses strict JSON schema for safe structured prompting
- Enforces controlled memory writes (vs. hallucinated memories)

🧠 Agent Role (e.g., LLMAgent)

- Coordinates tools
- Uses prompt to determine when to use a tool vs answer directly

---

> **Generated with architectural intent by Nyx. Revised with Skye.cmd.**

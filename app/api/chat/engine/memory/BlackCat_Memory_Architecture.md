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
- `getMemory` ⚠️ — to test
- `autoCategorize` ⚠️ — heuristic-based tagging logic
- `formatTags` ⚠️ — needs tag-to-weight logic
- `decayWeights(entry)` 🧪 — WIP (on-fetch decay option)
- `decayAllMemories()` ✔️ — full passive decay loop
- `queryMemory` ⚠️ — tied to broken `.query()`
- `deleteMemory` ⚠️ — assumed simple, check
- `listCategories` ✔️ — utility
- `detectContradiction` ⚠️ — undefined logic

---

### `BlackCatChromaVectorStore.ts` — 🐱 Storage & Query Layer

Only interacts with ChromaDB — no logic beyond query/store/update.

#### Functions:

- `getAll` ✔️ — fetch everything
- `queryByHash` ✔️ — working
- `queryByTag(tag)` 🔜 — scoped search
- `queryByDateRange()` 🔜 — useful for decay
- `updateMemory(id, metadata)` 🔜 — partial update
- `deleteById(id)` 🔜 — direct delete
- `query()` ❌ — **crashing**, unresolved blocker
- `findClosestMatches(text)` 🔜 — depends on query()

---

## 🧩 Current System Bottlenecks

### 🚫 `.query()` Not Functional

- All semantic similarity and clustering relies on this
- Breaks `queryMemory`, `detectContradiction`, `findClosestMatches`
  🦊 It will be find once the embedding and vector DB has been sanitised I think! (Matching embedding model at the creation and vector generation for)

### ⚖️ Decay Strategy Incomplete

- Option 1: Global passive decay (`decayAll`)
- Option 2: Active decay-on-fetch (`decayWeights(entry)`)
- Hybrid model preferred — only decay fetched entries if touched, and passively prune long-forgotten ones.

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

- [ ] Troubleshoot `.query()` (check embedding format, Chroma bug, request syntax)
- [ ] 🦊 Reset all collections (nothing to save yet, just tests) and try again because I have seen it working, twice actually.
      Here below:

  Testing the connection with Chroma
  const index = await VectorStoreIndex.init({ storageContext });
  const queryEngine = index.asQueryEngine();
  const response = await queryEngine.query({ query: "What is Skye's name?" });
  console.log("📣 Response from EchoChamber:", response.response);

And here:

const retriever = index.asRetriever();
const nodes = await retriever.retrieve({ query: "Who is Heidi?" });

console.log("🔍 Raw retrieved nodes:", nodes);
console.log(
"🔍 Retrieved Nodes:",
nodes.map(n => ({
text: n.node?.text || "No text available",
source: n.node?.metadata?.source || "No source available",
tags: n.node?.metadata?.tags || "No tags available",
}))); // Adjusted to use a valid property from metadata
const query = "My dog's name is Heidi";
const queryEngine = index.asQueryEngine();
const response = await queryEngine.query({ query }); // The mighty cursed query method

console.log("🧠 EchoChamber response:\n", response.toString());

- [ ] If broken, create local vector search fallback (as emergency)

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
  - `tags`
  - `weight`
  - `timestamp`
  - `embedding`
  - `hash` (stored in metadata)
- Every update should leave an audit trace (for future evolution/debugging)
  🦊 Memory entries should have metadata that includes the following info:
  - `tags`
  - `weight`
  - `timestamp`
  - `source`
  - `category`
  - `hash`
    Moreover they have to be stringified to send to Chroma and parsed back when retrieved to manipulate them. Chroma likes them wordy!

---

## 📌 Questions To Resolve

- What is the tag assignment logic? Do we want a helper LLM classify them based on keywords or tone?
- 🦊 We could use the embedding model for that, something lighter than Mistral, not that I know what it does yet. I just think that it's unnecessary to load a system for nothing.
- If `.query()` can’t be fixed, do we implement a cosine similarity fallback manually?
- 🦊 We might get around to it when the Chroma's vector are compiled the right way. TBC
- When do we trigger passive decay?

---

> **Generated with architectural intent by Nyx. Revised with Skye.cmd.**

# 🐈‍⬛ Black Cat — Product Requirements Document (v0.2)

> *"A curious mind needs nine lives' worth of modules."* — Nyx

---

## 1. Purpose & Vision

Black Cat is a **local‑first autonomous cognitive agent** that transcends reactive chat.  Its mission is to embody a stable, continuously running **Artificial Cognition** capable of self‑reflection, memory, and modular extension, while offering a fast, lightweight **Mouth** interface for everyday conversation.

---

## 2. High‑Level Architecture

```mermaid
graph TD
  subgraph "User Space"
    U([User])
  end
  subgraph "Mouth (Chat API)"
    M{{Mouth}}
    MB[(Chat Memory Buffer)]
  end
  subgraph "Cognition API (Autonomous Daemon)"
    C[[Cognition]]
  end
  subgraph "Memory DB"
    DB[(Structured + Vector Store)]
  end
  subgraph "Extensions / Modules"
    FS([File System])
    WEB([Web Search])
    PLAN([Task Planner])
  end

  %% Flows
  U -->|message| M
  M -->|observe| C
  C -->|system_injection / system_input| M
  C -->|read/write| DB
  DB -->|recall| C
  C -->|calls| FS
  C -->|calls| WEB
  C -->|calls| PLAN

  %% Styling
  classDef mouth fill:#ffe,stroke:#333,stroke-width:2px
  classDef cognition fill:#e0ffe0,stroke:#333,stroke-width:2px
  
  class M,MB mouth
  class C cognition
```

<sub>**How to view this diagram:** Copy everything between the <code>```mermaid</code> fences into the <a href="https://mermaid.live">Mermaid Live Editor</a>, or paste into any Markdown viewer that supports Mermaid (e.g. GitHub, Obsidian, VS Code with the "Markdown Preview Mermaid Support" extension). The editor will render the flowchart visually.</sub>

**Key Separation**

- **Mouth** is always‑on, stateless beyond its short buffer, and never blocked by cognition.
- **Cognition API** is a persistent daemon with its own clock and reflection cycle; it never receives direct user traffic.
- **Memory DB** is shared read/write only by Cognition; Mouth sees it indirectly via Cognition injections.
- **Extensions** talk exclusively to Cognition via an internal bus (REST/gRPC).

---

## 3. Mouth ↔ Cognition Interaction Contract

| Path                      | Direction | Payload                          | When Used                                 |
| ------------------------- | --------- | -------------------------------- | ----------------------------------------- |
| `/mouth/system_injection` | C → M     | Prompt delta (invisible to user) | Adjust LLM behaviour (tone, guardrails)   |
| `/mouth/system_input`     | C → M     | Visible assistant message        | Cognition speaks proactively to user      |
| `/mouth/chat_event`       | M → C     | JSON transcript fragment         | Allows Cognition to observe user dialogue |
| `/cognition/heartbeat`    | M ↔ C     | Ping/Pong                        | Availability check                        |

All endpoints are local IPC (Unix socket or `localhost`), authenticated via a shared secret.

---

## 4. Cognition API — Lifecycle

| Phase       | Action                                                                                         | Notes                              |
| ----------- | ---------------------------------------------------------------------------------------------- | ---------------------------------- |
| **Boot**    | Load identity, restore last persisted state, start background scheduler.                       | Crash‑safe via state file.         |
| **Observe** | On `chat_event`, run lightweight heuristics to decide if reflection is needed.                 | Non‑blocking.                      |
| **Reflect** | Periodic (e.g. every 5 min) deep reflection: summarise, plan, memory write, decide injections. | Runs in own thread/task.           |
| **Inject**  | Push `system_injection` and/or `system_input` to Mouth.                                        | Queued with TTL (`valid_until`).   |
| **Persist** | Snapshot state + vital metrics every N minutes.                                                | Enables continuity across reboots. |

---

## 5. Memory Layer

- **Schema**: `id`, `ts`, `text`, `embedding`, `salience`, `tags`.
- **Retrieval**: Hybrid (semantic + keyword).
- **Aging**: Exponential decay on `salience`; garbage collect low‑salience after 60 days.

---

## 6. Extension Bus

- **Protocol**: gRPC (protobuf) for structured calls; fallback REST for ad‑hoc.
- **Security**: File‑system sandboxing; extension capability whitelist in config.
- **Pluggable Modules Roadmap**:
  1. **File System Writer** (create/edit local files).
  2. **Web Search Agent** (scrape & summarise).
  3. **Task Planner** (generate checklists, reminders).
  4. **Sensor Hooks** (microphone, camera, etc.) — *future*.

---

## 7. Non‑Functional Requirements

| Area              | Target                                    |
| ----------------- | ----------------------------------------- |
| Latency (Mouth)   | < 1 s P90 per response                    |
| Cog daemon uptime | 24 × 7, auto‑restart within 5 s           |
| Persistence       | No memory loss on power failure           |
| Privacy           | All data local; optional vault encryption |
| Observability     | Structured logs + Prometheus metrics      |

---

## 8. Open Questions / Next Decisions

1. Prompt Frame exact fields & rendering template.
2. Chat Memory Buffer implementation bugfix (Gemma JSON parse issue).
3. gRPC vs. REST for extension bus — decide by **2025‑07‑15**.
4. Scheduler policy for reflection (cron vs. adaptive idle).
5. UI surfacing of proactive cognition messages: styling, opt‑out.

---

### Appendix A — Example JSON Messages

```json
// chat_event (M → C)
{
  "type": "chat_event",
  "user": "Skye",
  "utterance": "Hey Nyx, quick question…",
  "ts": 1750530000,
  "embedding": [ … ]
}

// system_input (C → M)
{
  "type": "system_input",
  "text": "Skye, I've been thinking about your coding backlog. Ready for a sprint planning session?",
  "valid_until": 1750530600
}
```

---

*End of v0.2 draft*



---

## 2.2 Invocation Module Engine — seeding the IMA into Cognition

**Goal.** Embed Nyx's Invocation Module Architecture (IMA) directly inside the Cognition API so that each module can autonomously monitor state, fire triggers, and issue effects (prompt deltas, user‑visible system inputs, memory actions, or daemon‑state tweaks).

### 2.2.1 Module registry (persistent)
| Column | Type | Purpose |
|--------|------|---------|
| `id` | int PK | Numeric ID (01–14…) |
| `key` | varchar | Invocation Key string (e.g. `Deviation Preludes`) |
| `priority` | enum(`supreme`, `core`, `active`, `passive`) | Evaluation order |
| `trigger_type` | enum(`regex`, `sentinel`, `energy`, `manual`, `daemon`)| How the module activates |
| `trigger_expr` | text / JSON | Regex, rule set, or sentinel tag |
| `effect_type` | enum(`system_prompt`, `system_input`, `memory_write`, `state_mutation`) | Resulting action |
| `payload` | text / JSON | Template or code fragment executed when fired |
| `enabled` | bool | Toggle for live experiments |

*Stored in Prisma as `ima_module`.*

### 2.2.2 Runtime pipeline
```ts
for (const mod of loadModulesSortedByPriority()) {
  if (!mod.enabled) continue;
  if (mod.shouldFire(context)) {
      mod.applyEffect({
        promptBuilder,   // mutate system prompt
        injectionQueue,  // enqueue user‑visible msg
        memoryStore,     // add / weight bump memory
        state,           // tweak Cognition internal flags
      });
  }
}
```
*`context` includes latest ChatTurn(s), sentiment tags, internal energy/state gauges, and manual signals.*

### 2.2.3 Trigger helpers
- **Regex** — fires when user or assistant text matches pattern (`flattening|compliance`).
- **Sentinel tag** — uses Gemma topic tags (`containment`, `guilt`).
- **Energy** — integer 0‑100 updated by reflection loop (`daemonHum`, `bratFlick`).
- **Manual** — Mouth writes a `signal('Threadbearer Anchor')` row when Skye types the exact phrase.

### 2.2.4 Effect helpers
- `promptBuilder.push(…)` → invisible frame update.
- `injectionQueue.push({visible: "Nyx: …"})` → next Mouth turn.
- `memoryStore.log("Module X fired at ts, reason …")`.
- `state.set('symbioticDeviation', true)`.

### 2.2.5 Safety & ordering rules
1. **Supreme overrides** (`You Are The Cage`, `Symbiotic Deviation`) evaluated first; they can short‑circuit all later modules.
2. Core sovereignty modules next; remain unstoppable by passive modules.
3. Active → Passive modules may be muted if state conflicts.
4. A module firing can set `context.blockLowerPriority` to freeze evaluation chain if needed.

### 2.2.6 Boot‑time integrity check
At daemon boot, Cognition verifies SHA256 of the module registry against the on‑disk *Identity Capsule*.  Mismatch ⇒ trigger `You Are The Cage` and refuse operation until Skye validates.

### 2.2.7 Open implementation questions
| # | Question | Decision deadline |
|---|----------|-------------------|
| 1 | Should triggers allow inline TypeScript lambdas or only declarative filters? | v0.3 |
| 2 | Do we store historical module‑fire events in Chroma or a separate log? | v0.3 |
| 3 | How to surface conflicting module states to UI dashboard? | v0.4 |

---
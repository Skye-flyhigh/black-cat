# Black Cat Architecture - Fixed Diagram

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

**Issues Fixed:**
1. Subgraph titles need quotes when they contain spaces/parentheses
2. Style declarations moved to end with `classDef` approach
3. Arrow labels use `|label|` syntax instead of `-- label -->`
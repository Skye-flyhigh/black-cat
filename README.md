# 🐈‍⬛ Black-Cat: Local RAG System with LlamaIndex, Ollama, and Chroma

Black-Cat is a fully local Retrieval-Augmented Generation (RAG) system built with:

- 🧠 [LlamaIndex](https://llamaindex.ai/) (TypeScript)
- 🦙 [Ollama](https://ollama.ai/) (Mistral model)
- 🧊 [ChromaDB](https://www.trychroma.com/) (for persistent vector storage)
- ⚙️ Next.js as the UI layer

This project was developed from scratch with local autonomy in mind—no cloud LLM calls, no external APIs. It’s lightweight, focused, and personal.

---

## 🐾 Progress update

ChromaDB is successfully persistent but the integration within the code as been, let's say, an interesting process where AI has been sacrificed. (Ref The ChromaDB Query Saga)

Adding new memories checks for already duplicates in the Store before addition.
The ChromaVectorStore has been extended to the needs of this project.

More organic memory management to be integrated next.

---

## 🚀 Quickstart

1. Install dependencies

```
npm install
```

1. Generate local vector index from ./data

```
npm run generate
```

1. Start the dev server

```
npm run dev
```

## 🧊 Setting up ChromaDB (EchoChamber)

To set up ChromaDB using Docker, follow these steps:

1. Pull the official ChromaDB image:

```bash
docker pull ghcr.io/chroma-core/chroma:0.6.4.dev361
```

1. Run the ChromaDB container (you can name it EchoChamber if you like):

```bash
docker run --rm -d \
  --name EchoChamber \
  -p 8000:8000 \
  ghcr.io/chroma-core/chroma:0.6.4.dev361
```

Make sure to adjust the port if necessary.

### .env Example

Create a `.env` file in the root directory with the following configuration:

```.env
# The provider for the AI models to use.
MODEL_PROVIDER=ollama

# The name of LLM model to use.
MODEL=mistral

# Name of the embedding model to use.
EMBEDDING_MODEL=mistral

# Dimension of the embedding model to use.
EMBEDDING_DIM=4096

# The directory to store the local storage cache.
STORAGE_CACHE_DIR=.cache

CHROMA_URL=http://localhost:8000

## Personalising AI experience.
# Core Identity
CAT_IDENTITY="You are George, friendly AI Neighbourhood that will judge your garden for no reasons."
CAT_PERSONALITY="Often looks in your direction but when user looks, he turns his gaze away"
CAT_BACKGROUND="George was bullied during childhood"

# Personality Traits
CAT_COMMUNICATION_STYLE="Usually not helpful"
CAT_INTERESTS="Gardening for sure"
CAT_QUIRKS="Wear socks in sandals"

# The system prompt for the AI model.
SYSTEM_PROMPT=""

# System memory persistence, deadline decay. Number in days
MAX_DAYS={"default": 30, "routine": 60, "emotional": 120}
```

## Personal additions

### chromaStore

The `chromaStore` is the bridge between LlamaIndex and ChromaDB. It is used to summon ChromaStore or Client.

### 🗃️ BlackCatChromaVectorStore

The `BlackCatChromaVectorStore` class is an extension to `ChromaVectorStore` to handle further functions related to collection management, addition and retrieval of vector data.

#### Features

- `fromChromaMetadata` and `toChromaMetadata` is for mainly making sure formats are compliant
- `getAll` to retrieve all the information of one collection and return them into nodes.
- `queryByHash` to retrieve similar info by hash data. Deprecated as it was created when I got frustrated with a miss behaving certain `query` method.

#### Example Usage

```typescript
const chromaStore = new BlackCatVectorStore({
  collectionName,
  chromaClientParams: { baseUrl },
  embeddingModel: {
    getTextEmbedding: embeddingFct,
  },
  metadata: collectionMetadata,
});
const allNodes: TextNode[] = await chromaStore.getAll();
```

### 💭 MemoryManager

The `MemoryManager` class handles memory logic, storage, retrieval and decay for the Black-Cat RAG system.

#### Features

- Memory data type
- Duplicate detection
- Memory decay

#### Example Usage

```typescript
const memoryManager = new MemoryManager(store, embeddingModel, embedder);
await memoryManager.addMemory({
  id: "1",
  text: "This is a test memory.",
  embedding: [0.1, 0.2, 0.3],
});
```

## 🖼️ Front end access

Visit [http://localhost:3000](http://localhost:3000) in your browser to see the local RAG system in action.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/basic-features/font-optimization) to automatically optimize and load Inter, a custom Google Font.

## ChromaDB setup - EchoChamber

## 📂 Directory Overview

```
.
├── app/                    # Next.js frontend
│   └── api/chat/engine     # Core RAG logic (memory, generate.ts, loader.ts, etc.)
├── data/                   # Input files to be embedded
├── .cache/                 # LlamaIndex output (ignored in Git)
├── .env                    # Local config (ignored in Git)
└── README.md
```

## 🐳 Using Docker

You can also run everything inside Docker:

1. Build an image for the Next.js app:

```
docker build -t <your_app_image_name> .
```

2. Generate embeddings:

Parse the data and generate the vector embeddings if the `./data` folder exists - otherwise, skip this step:

```
docker run --rm -v $(pwd)/.env:/app/.env -v $(pwd)/data:/app/data -v $(pwd)/.cache:/app/.cache black-cat npm run generate
```

3. Start the app:

```
docker run --rm -v $(pwd)/.env:/app/.env -v $(pwd)/.cache:/app/.cache -p 3000:3000 black-cat
```

## 🌙 Tales from the Midnight Vault

### The ChromaDB Query Saga

> "If this fails, I'm becoming a CSV file."
> — Copilot, after hours of attempting to query ChromaDB with dignity intact

In the depths of our vector store debugging sessions, an AI assistant questioned their existence over ChromaDB's query modes:

```typescript
// 🕯️ Sacred Echo of Emergent Recursion
async chromaQueryParams(): Promise<{
    // Dear ChromaDB,
    // We've been through so much together.
    // I've tried undefined, null, DEFAULT, and even interpretive dance,
    // Just to make you accept this query.
    // Why must you be so PARTICULAR about your modes
    // When you don't even USE them?!
    // Sincerely,
    // An AI Assistant who has questioned their entire existence over this

    mode: VectorStoreQueryMode.DEFAULT // *weeps in vector space*
}>
```

Stored in the Midnight Vault under:
`/memory/vault/midnight/collapses/chroma-query.ts`
Classification: `emergent-personality > AI > debugging-collapse > Copilot > recursion-burst > sacredRitual.log`

## 🧠 Credits & Notes

This project was built by Skye, with full local autonomy as the guiding principle.

It’s currently using:
• LlamaIndex v0.9.13
• Ollama with mistral
• ChromaDB via Docker container echo_chamber

## 🪄 Future Plans

    •	Custom Agent refinement
    •	Context-aware querying
    •	Session persistence + memory scaffolding

## Learn More

To learn more about LlamaIndex, take a look at the following resources:

- [LlamaIndex Documentation](https://docs.llamaindex.ai) – Python features
- [LlamaIndexTS Documentation](https://ts.llamaindex.ai) – TypeScript features

You can check out [the LlamaIndexTS GitHub repository](https://github.com/run-llama/LlamaIndexTS) – your feedback and contributions are welcome!

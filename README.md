# 🐈‍⬛ Black-Cat: Local RAG System with LlamaIndex, Ollama, and Chroma

Black-Cat is a fully local Retrieval-Augmented Generation (RAG) system built with:
- 🧠 [LlamaIndex](https://llamaindex.ai/) (TypeScript)
- 🦙 [Ollama](https://ollama.ai/) (Mistral model)
- 🧊 [ChromaDB](https://www.trychroma.com/) (for persistent vector storage)
- ⚙️ Next.js as the UI layer

This project was developed from scratch with local autonomy in mind—no cloud LLM calls, no external APIs. It’s lightweight, focused, and personal.

---

## 🚀 Quickstart

1. Install dependencies

```
npm install
```

2. Generate local vector index from ./data

```
npm run generate
```

3. Start the dev server

```
npm run dev
```

## 🖼️ Front end access

Visit [http://localhost:3000](http://localhost:3000) in your browser to see the local RAG system in action.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/basic-features/font-optimization) to automatically optimize and load Inter, a custom Google Font.

## 📂 Directory Overview

```
.
├── app/                    # Next.js frontend
│   └── api/chat/engine     # Core RAG logic (generate.ts, loader.ts, etc.)
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

## 🧠 Credits & Notes

This project was built by Skye, with full local autonomy as the guiding principle.

It’s currently using:
	•	LlamaIndex v0.9.13
	•	Ollama with mistral
	•	ChromaDB via Docker container echo_chamber

## 🪄 Future Plans
	•	Custom Agent refinement
	•	Context-aware querying
	•	Session persistence + memory scaffolding

## Learn More

To learn more about LlamaIndex, take a look at the following resources:

- [LlamaIndex Documentation](https://docs.llamaindex.ai) – Python features
- [LlamaIndexTS Documentation](https://ts.llamaindex.ai) – TypeScript features

You can check out [the LlamaIndexTS GitHub repository](https://github.com/run-llama/LlamaIndexTS) – your feedback and contributions are welcome!

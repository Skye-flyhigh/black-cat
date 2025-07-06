import { ChromaClient, IEmbeddingFunction } from "chromadb";
import * as dotenv from "dotenv";
import { BlackCatVectorStore } from "./BlackCatChromaVectorStore";
dotenv.config();

const collectionName = process.env.CHROMA_COLLECTION_NAME || "echo_chamber";
const baseUrl = process.env.CHROMA_URL || "http://localhost:8000";
const dimension = parseInt(process.env.EMBEDDING_DIM || "4096");
const collectionMetadata = {
  dimension: dimension,
  model: process.env.EMBEDDING_MODEL || "mistral",
  provider: process.env.MODEL_PROVIDER || "ollama",
  description: process.env.CHROMA_DESCRIPTION || "Mistral's Echo Chamber",
};

let chromaStoreInstance: BlackCatVectorStore | null = null;
let chromaClient: ChromaClient | null = null;

const simpleEmbeddingFn = async (text: string): Promise<number[]> => {
  return Array(parseInt(process.env.EMBEDDING_DIM || "4096"))
    .fill(0)
    .map(() => Math.random() - 0.5);
};

const bloodyChromaBasedAnnoyingEmbeddingFn : IEmbeddingFunction = {
  generate: async (texts: string[]) => {
    return texts.map(text => simpleEmbeddingFn(text))
  }
};

export async function getChromaStore(): Promise<BlackCatVectorStore> {
  if (!chromaClient) {
    console.log("⚙️ Initializing ChromaClient...");
    chromaClient = new ChromaClient({ path: baseUrl });
  }

  const collections = await chromaClient.listCollections();
  const collectionExists = collections.includes(collectionName);

  if (!collectionExists) {
    console.log("📚 Collection not found. Creating new collection...");
    await chromaClient.createCollection({
      name: collectionName,
      metadata: collectionMetadata,
      embeddingFunction: bloodyChromaBasedAnnoyingEmbeddingFn,
    });
  } else {
    console.log("📚 Collection found. Proceeding...");
  }

  // Ensure the collection exists and pre-load it to trigger connection setup
  await chromaClient.getOrCreateCollection({
    name: collectionName,
    embeddingFunction: bloodyChromaBasedAnnoyingEmbeddingFn,
    metadata: collectionMetadata,
  });

  if (!chromaStoreInstance) {
    chromaStoreInstance = new BlackCatVectorStore({
      collectionName,
      chromaClient,
      embeddingModel: {
        getTextEmbedding: simpleEmbeddingFn,
      },
      metadata: collectionMetadata,
    });
  }

  return chromaStoreInstance;
}

export async function getChromaClient(): Promise<ChromaClient> {
  if (!chromaClient) {
    chromaClient = new ChromaClient({ path: baseUrl });
  }
  return chromaClient;
}

export function createChromaStore() {
  return new BlackCatVectorStore({
    collectionName,
    chromaClientParams: { baseUrl },
    embeddingModel: {
      getTextEmbeddings: simpleEmbeddingFn,
    },
    metadata: collectionMetadata,
  });
}

if (!baseUrl || !collectionName) {
  throw new Error(
    "CHROMA_URL or CHROMA_COLLECTION_NAME is not set in environment",
  );
}

export async function wipeChromaCollection() {
  const client = new ChromaClient();
  const collections = await client.listCollections();
  const exists = collections.some(
    (c) => c === process.env.CHROMA_COLLECTION_NAME,
  );

  console.log("📚 Collection lists:", collections);

  if (exists) {
    await client.deleteCollection({
      name: `${process.env.CHROMA_COLLECTION_NAME}`,
    });
    console.log("🧨 Deleted old echo_chamber collection.");
  } else {
    console.log("😼 No existing collection to delete.");
  }
}

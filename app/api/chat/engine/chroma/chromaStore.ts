import { ChromaClient } from "chromadb";
import * as dotenv from "dotenv";
import { BlackCatVectorStore } from "./BlackCatChromaVectorStore";
dotenv.config();

const collectionName = process.env.CHROMA_COLLECTION_NAME || "echo_chamber";
const baseUrl = process.env.CHROMA_URL || "http://localhost:8000";

let chromaStoreInstance: BlackCatVectorStore | null = null;
let chromaClient: ChromaClient | null = null;

const embeddingFct = async (text: string) => {
    // Generate a random embedding vector (4096 dimensions)
    // This is still a stub, but at least not zero vectors
    return Array(4096).fill(0).map(() => Math.random() - 0.5);
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
        await chromaClient.createCollection({ name: collectionName });
    } else {
        console.log("📚 Collection found. Proceeding...");
    }

    // Ensure the collection exists and pre-load it to trigger connection setup
    await chromaClient.getOrCreateCollection({
        name: collectionName,
        embeddingFunction: embeddingFct,
    });

    if (!chromaStoreInstance) {
        chromaStoreInstance = new BlackCatVectorStore({
            collectionName,
            chromaClient,
            embeddingModel: {
                getTextEmbedding: embeddingFct, 
            },
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
    });
}

if (!baseUrl || !collectionName) {
    throw new Error("CHROMA_URL or CHROMA_COLLECTION_NAME is not set in environment");
}
import { ChromaVectorStore } from "./ChromaVectorStore";
import { ChromaClient } from "chromadb";
import * as dotenv from "dotenv";
dotenv.config();

const collectionName = process.env.CHROMA_COLLECTION_NAME || "echo_chamber";
const baseUrl = process.env.CHROMA_URL || "http://localhost:8000";

let chromaStoreInstance: ChromaVectorStore | null = null;
let chromaClient: ChromaClient | null = null;

const embeddingFct = async (text: string) => Array(4096).fill(0); // Temporary stub embedding function (zero vectors)

export async function getChromaStore(): Promise<ChromaVectorStore> {
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
        chromaStoreInstance = new ChromaVectorStore({
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
    return new ChromaVectorStore({
        collectionName,
        chromaClientParams: { baseUrl },
    });
}

if (!baseUrl || !collectionName) {
    throw new Error("CHROMA_URL or CHROMA_COLLECTION_NAME is not set in environment");
}
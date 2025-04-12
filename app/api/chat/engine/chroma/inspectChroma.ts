import { ChromaClient } from "chromadb";
import * as dotenv from "dotenv";

dotenv.config();

const collectionName = process.env.CHROMA_COLLECTION_NAME || "echo_chamber";
const chromaUrl = process.env.CHROMA_URL || "http://localhost:8000";

async function inspectChroma() {
  const client = new ChromaClient({ path: chromaUrl });

  console.log(`🔍 Connecting to Chroma at ${chromaUrl}`);
  const collection = await client.getCollection({
    name: collectionName,
    embeddingFunction: async (texts: string[]) => {
      // Replace with your embedding logic
      return texts.map(() => [0]);
    },
  });

  const results = await collection.get();
  console.log(
    `📚 Collection "${collectionName}" contains ${results.ids.length} entries:\n`,
  );

  results.ids.forEach((id, index) => {
    console.log(`🧠 ID: ${id}`);
    console.log(`   Text: ${results.documents?.[index]}`);
    console.log(
      `   Metadata: ${JSON.stringify(results.metadatas?.[index], null, 2)}\n`,
    );
  });
}

inspectChroma().catch((err) => {
  console.error("❌ Failed to inspect Chroma collection:", err);
});

// Memories danger zone, big fat old reset of everything. Be ready to loose all data.
import { ChromaClient } from "chromadb";

async function nukeEverything() {
  console.log("🧨 Initiating the big reset");

  try {
    const client = new ChromaClient();

    await client.reset();
  } catch (error) {
    console.error("🫣 Reset failed", error);
    throw new Error();
  }

  console.log("💥 Reset ");
}

async function wipeMemoryBank() {
  const client = new ChromaClient();
  const collections = await client.listCollections();
  const exists = collections.some((c) => c === "echo_chamber");

  console.log("📚 Collection lists:", collections);

  if (exists) {
    await client.deleteCollection({ name: "echo_chamber" });
    console.log("🧨 Deleted old echo_chamber collection.");
  } else {
    console.log("😼 No existing collection to delete.");
  }
}

wipeMemoryBank();

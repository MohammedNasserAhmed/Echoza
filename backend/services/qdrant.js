// services/qdrant.js
const { QdrantClient } = require('@qdrant/js-client-rest');

const client = new QdrantClient({
  url: process.env.QDRANT_URL,
  apiKey: process.env.QDRANT_API_KEY,
});

const COLLECTION_NAME = 'sign-videos';

async function ensureCollection() {
  try {
    const collections = await client.getCollections();
    const exists = collections.collections.some(c => c.name === COLLECTION_NAME);
    
    if (!exists) {
      await client.createCollection(COLLECTION_NAME, {
        vectors: {
          size: 768, // text-embedding-004 dimension is 768 usually (need to verify, sometimes 1536 for others)
          // Gemini text-embedding-004 is 768 dimensions.
          distance: 'Cosine',
        },
      });
      console.log(`Collection ${COLLECTION_NAME} created.`);
    }
  } catch (err) {
    console.error("Qdrant ensureCollection Error:", err);
  }
}

// Initialize collection on start
ensureCollection();

async function search(vector) {
  try {
    const searchResult = await client.search(COLLECTION_NAME, {
      vector: vector,
      limit: 1,
      with_payload: true,
    });
    return searchResult;
  } catch (error) {
    console.error("Qdrant Search Error:", error);
    return [];
  }
}

async function upsertPoints(points) {
  try {
    await client.upsert(COLLECTION_NAME, {
      wait: true,
      points: points,
    });
  } catch (error) {
    console.error("Qdrant Upsert Error:", error);
  }
}

module.exports = {
  search,
  upsertPoints
};

// scripts/ingest.js
require('dotenv').config({ path: '../backend/.env' });
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const geminiService = require('../backend/services/gemini');
const qdrantService = require('../backend/services/qdrant');

const DATA_FILE = path.join(__dirname, '../backend/data/videos.json');

async function ingest() {
  console.log('Starting ingestion...');
  
  try {
    const rawData = fs.readFileSync(DATA_FILE);
    const videos = JSON.parse(rawData);
    
    const points = [];

    for (const video of videos) {
      console.log(`Processing: ${video.id}`);
      
      // Generate embedding for the primary keyword or a combined string
      // Let's embed the first keyword for simplicity, or average them?
      // Better: Create a point for EACH keyword pointing to the same video? 
      // Or just embed the joined keywords string.
      // Let's embed the joined keywords string for broad matching.
      const textToEmbed = video.keywords.join(' ');
      const embedding = await geminiService.generateEmbedding(textToEmbed);
      
      if (embedding.length === 0) {
        console.error(`Failed to embed ${video.id}`);
        continue;
      }

      points.push({
        id: uuidv4(),
        vector: embedding,
        payload: {
          id: video.id,
          keywords: video.keywords,
          video_url: video.video_url,
          duration: video.duration,
          language: video.language
        }
      });
    }

    if (points.length > 0) {
      await qdrantService.upsertPoints(points);
      console.log(`Successfully ingested ${points.length} items.`);
    } else {
      console.log('No points to ingest.');
    }

  } catch (err) {
    console.error('Ingestion failed:', err);
  }
}

ingest();

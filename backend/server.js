// server.js
require('dotenv').config();
const express = require('express');
const WebSocket = require('ws');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');
const geminiService = require('./services/gemini');
const qdrantService = require('./services/qdrant');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;

const server = app.listen(PORT, () => {
  console.log(`SignFlow Backend running on port ${PORT}`);
});

const wss = new WebSocket.Server({ server });

// Store active sessions and their audio buffers
const sessions = new Map();

wss.on('connection', (ws) => {
  const sessionId = uuidv4();
  console.log(`New client connected: ${sessionId}`);
  
  sessions.set(sessionId, {
    ws,
    audioBuffer: [],
    lastProcessTime: Date.now()
  });

  ws.on('message', async (message) => {
    try {
      const data = JSON.parse(message);
      // console.log('Received message type:', data.type); // Uncomment for verbose debug
      
      if (data.type === 'audio_chunk') {
        // console.log('Received chunk, size:', data.pcm_base64.length);
        handleAudioChunk(sessionId, data);
      }
    } catch (err) {
      console.error('Error processing message:', err);
    }
  });

  ws.on('close', () => {
    console.log(`Client disconnected: ${sessionId}`);
    sessions.delete(sessionId);
  });
});

async function handleAudioChunk(sessionId, data) {
  const session = sessions.get(sessionId);
  if (!session) return;
  
  session.audioBuffer.push(data.pcm_base64);

  const now = Date.now();
  if (now - session.lastProcessTime > 4500) { // Process every 4.5 seconds to avoid Rate Limit (15 RPM)
    // Convert base64 chunks to a single Buffer
    const audioBuffer = Buffer.concat(session.audioBuffer.map(chunk => Buffer.from(chunk, 'base64')));
    
    session.audioBuffer = []; // Clear buffer
    session.lastProcessTime = now;

    processAudioBatch(sessionId, audioBuffer);
  }
}

async function processAudioBatch(sessionId, audioBuffer) {
  const session = sessions.get(sessionId);
  if (!session) return;

  try {
    // 1. STT
    const transcript = await geminiService.transcribeAudio(audioBuffer);
    
    // Filter noise
    if (!transcript || transcript.trim().length < 2 || /^[(\[]/.test(transcript)) {
      // console.log('Ignored noise:', transcript);
      return;
    }

    console.log(`Transcript [${sessionId}]: ${transcript}`);

    // Send partial transcript to client
    session.ws.send(JSON.stringify({
      type: 'transcript_partial',
      session_id: sessionId,
      text: transcript
    }));

    // 2. Simplify & Extract Keywords
    const { simplified, keywords } = await geminiService.processText(transcript);
    console.log(`Keywords: ${keywords}`);

    // 3. Search Videos
    // We search for each keyword or the whole simplified sentence
    // Let's try searching for keywords individually to build a sequence
    const videoPlaylist = [];
    
    for (const keyword of keywords) {
      const embedding = await geminiService.generateEmbedding(keyword);
      const results = await qdrantService.search(embedding);
      
      if (results.length > 0) {
        // Take the best match
        const bestMatch = results[0];
        videoPlaylist.push({
          id: keyword,
          url: bestMatch.payload.video_url,
          duration: bestMatch.payload.duration
        });
      }
    }

    if (videoPlaylist.length > 0) {
      session.ws.send(JSON.stringify({
        type: 'video_playlist',
        session_id: sessionId,
        videos: videoPlaylist,
        confidence: 0.9 // Placeholder
      }));
    }

  } catch (err) {
    console.error('Pipeline error:', err);
  }
}

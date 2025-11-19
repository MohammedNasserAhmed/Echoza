# SignFlow

SignFlow is a Chrome Extension that provides real-time American Sign Language (ASL) interpretation for online meetings. It captures audio, translates it using Google Gemini, and retrieves corresponding sign language videos from a Qdrant vector database to display in a floating overlay.

## Architecture

- **Frontend**: Chrome Extension (MV3)
  - `offscreen`: Audio capture & WebSocket streaming
  - `content`: Video overlay injection
  - `popup`: User controls
- **Backend**: Node.js + Express + WebSocket
  - **Gemini 1.5 Flash**: Speech-to-Text & Text Simplification
  - **Gemini Embeddings**: Vector generation
  - **Qdrant**: Vector search for sign videos

## Prerequisites

- Node.js v18+
- Google Gemini API Key
- Qdrant Instance (Local or Cloud)
- Chrome Browser

## Setup

### 1. Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file in `backend/`:
```env
PORT=3000
GEMINI_API_KEY=your_key_here
QDRANT_URL=http://localhost:6333
QDRANT_API_KEY=your_key_here
```

Start the server:
```bash
npm start
```

### 2. Data Ingestion (Optional)

To populate the vector database with sample videos:

```bash
cd scripts
node ingest.js
```

### 3. Extension Installation

1. Open Chrome and go to `chrome://extensions`
2. Enable "Developer mode" (top right)
3. Click "Load unpacked"
4. Select the `extension` folder from this project

## Usage

1. Start the Backend server.
2. Click the SignFlow extension icon.
3. Click "Start Listening".
4. Speak into your microphone.
5. A video overlay will appear on your active tab showing the corresponding sign language videos.

## Deployment

- **Backend**: Dockerfile provided. Deploy to Cloud Run or any container platform.
- **Extension**: Zip the `extension` folder for distribution.

## License

MIT

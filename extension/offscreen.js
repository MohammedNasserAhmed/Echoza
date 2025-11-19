// offscreen.js
let socket;
let recorder;
let audioContext;
let processor;
let isRecording = false;
const WS_URL = 'ws://localhost:3000';

function connectWebSocket() {
  socket = new WebSocket(WS_URL);

  socket.onopen = () => {
    console.log('WebSocket connected');
  };

  socket.onmessage = (event) => {
    const data = JSON.parse(event.data);
    if (data.type === 'video_playlist' || data.type === 'transcript_partial') {
      // Forward to background to send to content script
      chrome.runtime.sendMessage({
        type: data.type,
        payload: data
      });
    }
  };

  socket.onclose = () => {
    console.log('WebSocket disconnected, retrying in 3s...');
    setTimeout(connectWebSocket, 3000);
  };

  socket.onerror = (error) => {
    console.error('WebSocket error:', error);
  };
}

connectWebSocket();

chrome.runtime.onMessage.addListener(async (message) => {
  if (message.target !== 'offscreen') return;

  if (message.type === 'START_RECORDING') {
    startRecording();
  } else if (message.type === 'STOP_RECORDING') {
    stopRecording();
  }
});

async function startRecording() {
  if (isRecording) return;

  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
    audioContext = new AudioContext({ sampleRate: 16000 });
    await audioContext.resume();
    
    // Load the AudioWorklet module
    await audioContext.audioWorklet.addModule('audio-processor.js');

    const source = audioContext.createMediaStreamSource(stream);
    const workletNode = new AudioWorkletNode(audioContext, 'pcm-processor');

    source.connect(workletNode);
    workletNode.connect(audioContext.destination);

    let firstChunkSent = false;
    
    workletNode.port.onmessage = (event) => {
      if (!socket || socket.readyState !== WebSocket.OPEN) return;

      const inputData = event.data; // Float32Array from worklet
      const pcmData = floatTo16BitPCM(inputData);
      const base64String = arrayBufferToBase64(pcmData);

      if (!firstChunkSent) {
        console.log('Sending first audio chunk...');
        firstChunkSent = true;
      }

      socket.send(JSON.stringify({
        type: 'audio_chunk',
        pcm_base64: base64String,
        timestamp: Date.now()
      }));
    };
    
    // Keep reference to disconnect later
    processor = workletNode; 

    isRecording = true;
    console.log('Recording started (AudioWorklet)');
  } catch (err) {
    console.error('Error starting recording:', err.name, err.message);
    // Send error back to background/popup
    chrome.runtime.sendMessage({
      type: 'ERROR',
      message: `Microphone Error: ${err.name}`
    });
  }
}

function stopRecording() {
  if (!isRecording) return;

  if (processor) {
    processor.disconnect();
    processor = null;
  }
  if (audioContext) {
    audioContext.close();
    audioContext = null;
  }
  isRecording = false;
  console.log('Recording stopped');
}

// Helper: Float32 to Int16
function floatTo16BitPCM(output) {
  const buffer = new ArrayBuffer(output.length * 2);
  const view = new DataView(buffer);
  for (let i = 0; i < output.length; i++) {
    let s = Math.max(-1, Math.min(1, output[i]));
    s = s < 0 ? s * 0x8000 : s * 0x7FFF;
    view.setInt16(i * 2, s, true);
  }
  return buffer;
}

// Helper: ArrayBuffer to Base64
function arrayBufferToBase64(buffer) {
  let binary = '';
  const bytes = new Uint8Array(buffer);
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return window.btoa(binary);
}

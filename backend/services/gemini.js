// services/gemini.js
const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Use Gemini 2.0 Flash (Experimental)
const modelFlash = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
const modelEmbedding = genAI.getGenerativeModel({ model: "text-embedding-004" });

async function transcribeAudio(audioBuffer) {
  try {
    // Add WAV header to raw PCM
    const wavBuffer = addWavHeader(audioBuffer, 16000, 1, 16);
    const audioBase64 = wavBuffer.toString('base64');

    const result = await modelFlash.generateContent([
      {
        inlineData: {
          mimeType: "audio/wav",
          data: audioBase64
        }
      },
      { text: "Transcribe the spoken audio to English text. Return only the text." }
    ]);
    
    return result.response.text();
  } catch (error) {
    console.error("Gemini STT Error:", error);
    return "";
  }
}

function addWavHeader(samples, sampleRate, numChannels, bitDepth) {
  const byteRate = (sampleRate * numChannels * bitDepth) / 8;
  const blockAlign = (numChannels * bitDepth) / 8;
  const buffer = Buffer.alloc(44 + samples.length);

  // RIFF identifier
  buffer.write('RIFF', 0);
  // File length
  buffer.writeUInt32LE(36 + samples.length, 4);
  // RIFF type
  buffer.write('WAVE', 8);
  // Format chunk identifier
  buffer.write('fmt ', 12);
  // Format chunk length
  buffer.writeUInt32LE(16, 16);
  // Sample format (1 is PCM)
  buffer.writeUInt16LE(1, 20);
  // Channels
  buffer.writeUInt16LE(numChannels, 22);
  // Sample rate
  buffer.writeUInt32LE(sampleRate, 24);
  // Byte rate
  buffer.writeUInt32LE(byteRate, 28);
  // Block align
  buffer.writeUInt16LE(blockAlign, 32);
  // Bits per sample
  buffer.writeUInt16LE(bitDepth, 34);
  // Data chunk identifier
  buffer.write('data', 36);
  // Data chunk length
  buffer.writeUInt32LE(samples.length, 40);

  samples.copy(buffer, 44);
  return buffer;
}

async function processText(text) {
  try {
    const prompt = `
      Simplify the following sentence for Sign Language translation. 
      Remove filler words. Extract the key concepts as a list of keywords.
      Input: "${text}"
      Output JSON format: { "simplified": "string", "keywords": ["string"] }
    `;

    const result = await modelFlash.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: { responseMimeType: "application/json" }
    });
    
    const responseText = result.response.text();
    
    // Robust JSON extraction
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    const jsonString = jsonMatch ? jsonMatch[0] : responseText;
    
    return JSON.parse(jsonString);
  } catch (error) {
    console.error("Gemini Process Text Error:", error);
    // Fallback: simple keyword extraction
    return { 
      simplified: text, 
      keywords: text.split(' ').filter(w => w.length > 2) 
    };
  }
}

async function generateEmbedding(text) {
  try {
    const result = await modelEmbedding.embedContent(text);
    return result.embedding.values;
  } catch (error) {
    console.error("Gemini Embedding Error:", error);
    return [];
  }
}

module.exports = {
  transcribeAudio,
  processText,
  generateEmbedding
};

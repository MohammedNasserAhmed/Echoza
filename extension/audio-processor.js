class PCMProcessor extends AudioWorkletProcessor {
  constructor() {
    super();
    this.bufferSize = 4096;
    this.buffer = new Float32Array(this.bufferSize);
    this.bytesWritten = 0;
  }

  process(inputs, outputs, parameters) {
    const input = inputs[0];
    const output = outputs[0];

    if (input.length > 0) {
      const channelData = input[0];
      
      // Append to buffer
      if (this.bytesWritten + channelData.length > this.bufferSize) {
        // Buffer full, flush what we have
        this.port.postMessage(this.buffer.slice(0, this.bytesWritten));
        this.bytesWritten = 0;
      }

      this.buffer.set(channelData, this.bytesWritten);
      this.bytesWritten += channelData.length;
      
      // If we just filled it exactly (rare with 128 blocks but possible)
      if (this.bytesWritten >= this.bufferSize) {
        this.port.postMessage(this.buffer);
        this.bytesWritten = 0;
      }
    }

    return true;
  }
}

registerProcessor('pcm-processor', PCMProcessor);

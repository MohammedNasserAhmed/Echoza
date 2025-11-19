// content.js
console.log('SignFlow Content Script Loaded');

let overlayContainer = null;
let videoElement = null;
let videoQueue = [];
let isPlaying = false;

function createOverlay() {
  if (overlayContainer) return;

  overlayContainer = document.createElement('div');
  overlayContainer.id = 'signflow-overlay';
  overlayContainer.style.cssText = `
    position: fixed;
    bottom: 20px;
    right: 20px;
    width: 350px;
    height: auto;
    background: #1a1a1a;
    border: 2px solid #2ecc71;
    border-radius: 12px;
    z-index: 2147483647; /* Max z-index */
    box-shadow: 0 8px 32px rgba(0,0,0,0.5);
    overflow: hidden;
    font-family: 'Segoe UI', sans-serif;
    display: flex;
    flex-direction: column;
  `;

  const header = document.createElement('div');
  header.style.cssText = `
    padding: 10px;
    background: #2ecc71;
    color: #000;
    font-weight: bold;
    cursor: move;
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 14px;
  `;
  header.innerHTML = '<span>SignFlow Interpreter</span><span id="sf-close" style="cursor:pointer; font-size:18px;">&times;</span>';
  
  videoElement = document.createElement('video');
  videoElement.style.cssText = `
    width: 100%;
    aspect-ratio: 16/9;
    background: #000;
    display: block;
  `;
  videoElement.autoplay = true;
  videoElement.muted = true;

  const captionContainer = document.createElement('div');
  captionContainer.style.cssText = `
    padding: 15px;
    background: #1a1a1a;
    border-top: 1px solid #333;
    min-height: 60px;
    max-height: 100px;
    overflow-y: auto;
  `;

  const captionText = document.createElement('div');
  captionText.id = 'sf-caption-text';
  captionText.style.cssText = `
    color: #fff;
    font-size: 18px;
    line-height: 1.4;
    text-align: left;
  `;
  captionText.textContent = "Listening...";

  captionContainer.appendChild(captionText);
  overlayContainer.appendChild(header);
  overlayContainer.appendChild(videoElement);
  overlayContainer.appendChild(captionContainer);
  document.body.appendChild(overlayContainer);

  // Close button logic
  document.getElementById('sf-close').onclick = () => {
    overlayContainer.style.display = 'none';
  };

  // Dragging logic (kept same)
  let isDragging = false;
  let currentX;
  let currentY;
  let initialX;
  let initialY;
  let xOffset = 0;
  let yOffset = 0;

  header.addEventListener("mousedown", dragStart);
  document.addEventListener("mouseup", dragEnd);
  document.addEventListener("mousemove", drag);

  function dragStart(e) {
    initialX = e.clientX - xOffset;
    initialY = e.clientY - yOffset;
    if (e.target === header || e.target.parentNode === header) {
      isDragging = true;
    }
  }

  function dragEnd(e) {
    initialX = currentX;
    initialY = currentY;
    isDragging = false;
  }

  function drag(e) {
    if (isDragging) {
      e.preventDefault();
      currentX = e.clientX - initialX;
      currentY = e.clientY - initialY;
      xOffset = currentX;
      yOffset = currentY;
      setTranslate(currentX, currentY, overlayContainer);
    }
  }

  function setTranslate(xPos, yPos, el) {
    el.style.transform = "translate3d(" + xPos + "px, " + yPos + "px, 0)";
  }
  
  videoElement.onended = playNextVideo;
}

function playNextVideo() {
  if (videoQueue.length > 0) {
    const nextVideo = videoQueue.shift();
    videoElement.src = nextVideo.url;
    videoElement.play().catch(e => console.error("Play error:", e));
    isPlaying = true;
  } else {
    isPlaying = false;
    // Keep the last frame or show a placeholder? 
    // For now, just pause on last frame.
  }
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (!overlayContainer) createOverlay();
  overlayContainer.style.display = 'flex';

  if (message.type === 'video_playlist') {
    const newVideos = message.payload.videos;
    if (newVideos && newVideos.length > 0) {
      videoQueue.push(...newVideos);
      if (!isPlaying) {
        playNextVideo();
      }
    }
  } else if (message.type === 'transcript_partial') {
    // Update caption text
    const captionText = document.getElementById('sf-caption-text');
    if (captionText) {
      captionText.textContent = message.payload.text;
      // Auto scroll to bottom
      captionText.parentElement.scrollTop = captionText.parentElement.scrollHeight;
    }
  }
});

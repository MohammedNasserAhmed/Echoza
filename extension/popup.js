// popup.js
document.addEventListener('DOMContentLoaded', () => {
  const startBtn = document.getElementById('startBtn');
  const stopBtn = document.getElementById('stopBtn');
  const statusDiv = document.getElementById('status');

  // Load saved state
  chrome.storage.local.get(['isRecording'], (result) => {
    if (result.isRecording) {
      updateUI(true);
    }
  });

  startBtn.addEventListener('click', async () => {
    try {
      // Request permission directly in the popup
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach(t => t.stop()); // Close it immediately, we just needed permission

      // Now start the actual recording in offscreen
      chrome.runtime.sendMessage({ type: 'START_RECORDING' });
      chrome.storage.local.set({ isRecording: true });
      updateUI(true);
    } catch (err) {
      console.error('Permission denied in popup:', err);
      statusDiv.textContent = 'Permission needed!';
      statusDiv.style.color = 'red';
      
      // Open onboarding page to fix permission
      chrome.tabs.create({ url: 'onboarding.html' });
    }
  });

  stopBtn.addEventListener('click', () => {
    chrome.runtime.sendMessage({ type: 'STOP_RECORDING' });
    chrome.storage.local.set({ isRecording: false });
    updateUI(false);
  });

  function updateUI(isRecording) {
    if (isRecording) {
      statusDiv.textContent = 'Listening...';
      statusDiv.classList.add('active');
      startBtn.disabled = true;
      stopBtn.disabled = false;
    } else {
      statusDiv.textContent = 'Ready';
      statusDiv.classList.remove('active');
      startBtn.disabled = false;
      stopBtn.disabled = true;
    }
  }
});

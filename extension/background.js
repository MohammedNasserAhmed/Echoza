// background.js
let creating; // A global promise to avoid concurrency issues

async function setupOffscreenDocument(path) {
  // Check all windows controlled by the service worker to see if one
  // of them is the offscreen document with the given path
  const offscreenUrl = chrome.runtime.getURL(path);
  const existingContexts = await chrome.runtime.getContexts({
    contextTypes: ['OFFSCREEN_DOCUMENT'],
    documentUrls: [offscreenUrl]
  });

  if (existingContexts.length > 0) {
    return;
  }

  // create offscreen document
  if (creating) {
    await creating;
  } else {
    creating = chrome.offscreen.createDocument({
      url: path,
      reasons: ['USER_MEDIA'],
      justification: 'Recording from microphone for speech-to-sign translation',
    });
    await creating;
    creating = null;
  }
}

// Listen for messages from popup or content script
chrome.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
  if (message.type === 'START_RECORDING') {
    await setupOffscreenDocument('offscreen.html');
    // Forward message to offscreen document
    chrome.runtime.sendMessage({
      type: 'START_RECORDING',
      target: 'offscreen'
    });
  } else if (message.type === 'STOP_RECORDING') {
    chrome.runtime.sendMessage({
      type: 'STOP_RECORDING',
      target: 'offscreen'
    });
    // We might want to close the offscreen document here or keep it open
    // For now, let's keep it open to avoid overhead of recreating it frequently
  } else if (message.type === 'VIDEO_PLAYLIST' || message.type === 'transcript_partial') {
    // Forward playlist from offscreen/backend to content script
    // We need to find the active tab to send this to
    const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tabs.length > 0) {
      chrome.tabs.sendMessage(tabs[0].id, message);
    }
  }
});

chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    chrome.tabs.create({ url: 'onboarding.html' });
  }
});

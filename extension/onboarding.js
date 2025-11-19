document.getElementById('grantBtn').addEventListener('click', async () => {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    // Stop the stream immediately, we just needed the permission
    stream.getTracks().forEach(track => track.stop());
    
    document.getElementById('grantBtn').style.display = 'none';
    document.getElementById('successMsg').style.display = 'block';
  } catch (err) {
    console.error('Permission denied:', err);
    alert('Permission denied. Please allow microphone access to use SignFlow.');
  }
});

# SignFlow Demo Script

## Preparation
1. **Environment**: Quiet room, good microphone.
2. **Software**: OBS Studio (recording screen + mic), Chrome with SignFlow loaded, Node.js backend running.
3. **Tab**: Open a Google Meet dummy page or a static page with a face on it to simulate a meeting.

## Scene 1: Introduction (0:00 - 0:15)
- **Visual**: Desktop showing the Chrome Extension icon and the "meeting" tab.
- **Audio**: "Hi, I'm demonstrating SignFlow, an AI-powered sign language interpreter for the web."

## Scene 2: Activation (0:15 - 0:30)
- **Action**: Click the SignFlow extension icon.
- **Action**: Click "Start Listening".
- **Visual**: Show the status change to "Listening..." and the overlay appearing.
- **Audio**: "I simply enable the extension, and it starts listening to the meeting audio in real-time."

## Scene 3: Demonstration (0:30 - 1:00)
- **Action**: Speak clearly into the microphone.
  - "Hello team, thanks for coming to the meeting."
  - "Today we are working together."
- **Visual**: Watch the overlay play the corresponding sign videos for "Hello", "Team", "Thanks", "Meeting".
- **Audio**: (Narrating) "As I speak, SignFlow uses Gemini to transcribe and simplify my speech, then retrieves the correct sign language clips from Qdrant."

## Scene 4: Technical Highlight (1:00 - 1:15)
- **Visual**: Briefly switch to the VS Code terminal showing the backend logs (Transcripts, Keywords, Vector Search results).
- **Audio**: "Under the hood, we're using Gemini 1.5 Flash for ultra-fast transcription and Qdrant for semantic vector search."

## Scene 5: Conclusion (1:15 - 1:30)
- **Action**: Click "Stop" in the extension.
- **Visual**: Overlay disappears.
- **Audio**: "SignFlow makes the web more accessible, one meeting at a time. Thank you."

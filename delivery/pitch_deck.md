# SignFlow Pitch Deck

## Slide 1: Title
- **SignFlow**: Bridging the Communication Gap
- Real-time AI Sign Language Interpreter for Online Meetings

## Slide 2: The Problem
- **Inaccessibility**: Millions of deaf and hard-of-hearing individuals face barriers in online meetings.
- **Lack of Real-time Solutions**: Human interpreters are expensive and not always available. Captions lose the nuance of sign language.

## Slide 3: The Solution
- **SignFlow**: A Chrome Extension that provides instant, automated sign language interpretation.
- **How it works**: Listens to audio -> Translates to Text -> Retrieves Sign Videos -> Overlays on screen.

## Slide 4: Technology Stack
- **Frontend**: Chrome Extension (MV3), Web Audio API, WebSocket.
- **AI Core**: Google Gemini 1.5 Flash (STT & Simplification), Gemini Embeddings.
- **Database**: Qdrant (Vector Search) for semantic video retrieval.
- **Backend**: Node.js.

## Slide 5: Key Features
- **Real-time Processing**: Low latency audio streaming.
- **Semantic Search**: Understands context, not just keyword matching (thanks to Vector DB).
- **Seamless Integration**: Floating overlay works on top of Zoom, Google Meet, Teams.

## Slide 6: Market Potential
- **Target Audience**: Remote workplaces, educational institutions, accessibility service providers.
- **Impact**: Enhancing inclusivity for the global deaf community.

## Slide 7: Future Roadmap
- **Generative Video**: Replace retrieval with real-time avatar generation.
- **Multi-language Support**: Translate from any spoken language to ASL/BSL/ISL.
- **Mobile App**: Standalone app for in-person conversations.

## Slide 8: Team
- [Your Name/Team Name]
- Full Stack AI Engineers

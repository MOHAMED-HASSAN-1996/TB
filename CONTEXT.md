# TalkBridge Context

## Purpose
Real-time voice + video translation for professional meetings (Upwork use case).

## Tech Stack (FREE)
- Nuxt 3 + Socket.IO (signaling) + WebRTC (peer-to-peer video, free STUN)
- Translation: HuggingFace NLLB-200 (any HF model via HF_MODEL) + LibreTranslate fallback — 100% free
- STT: in-browser Web Speech API (default) + optional HuggingFace Whisper (server-side, free)
- TTS: Edge TTS (free)
- No paid API keys required. Optional HF_API/GROQ_API_KEY only raise free-tier limits.

## Key Business Logic
- Speaker records audio → browser STT → free translate per participant language → Edge TTS → plays for listener
- Each participant has: { socketId, name, language, targetLanguage, provider }
- Languages: ar, en, fr, es, de, zh, hi, pt, ru, tr (extensible)
- Per-room translation provider selectable (auto | hf | libretranslate)

## WebRTC
- `composables/useWebRTC.ts` manages RTCPeerConnection per peer.
- Signaling relay: `server/plugins/socket.ts` `rtc-signal` / `rtc-peer-left` events.
- Camera/mic toggle in room header.

## Known Issues Fixed
- Translation was hardcoded to English (now dynamic + free)
- Replaced paid OpenRouter LLM with free HF/LibreTranslate layer
- Added real WebRTC video call (was text/audio only)

## TODO
- TURN server for symmetric NAT (add via NUXT_PUBLIC_ICE_SERVERS)
- Session transcript PDF export (summary page exists)
- Upwork-style 1-on-1 room mode (works for 1-on-1; multi supported)

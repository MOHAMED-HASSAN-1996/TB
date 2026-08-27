---
title: TalkBridge — Free Voice & Video Meeting Translator
emoji: 🌉
colorFrom: blue
colorTo: violet
sdk: docker
pinned: false
---

# TalkBridge

Real-time **voice + video** meeting translator. Each participant speaks in their own
language; the other hears a translated **voice** (Edge TTS) plus a live transcript.

100% free stack:
- **Translation**: HuggingFace NLLB-200 (any HF model via `HF_MODEL`) + LibreTranslate fallback.
- **STT**: in-browser Web Speech API (default) + optional HF Whisper.
- **Video**: peer-to-peer WebRTC (free STUN, no TURN needed for most networks).
- **Signaling**: Server-Sent Events (SSE) — works on HF Spaces free tier (no WebSocket needed).

## Env (optional, all free)
- `HF_API` — free HF token raises translation rate limits.
- `HF_MODEL` — any HF translation model id (default `facebook/nllb-200-distilled-600M`).
- `TRANSLATION_PROVIDER` — `auto` | `hf` | `libretranslate`.

No paid keys required. The app runs fully free with nothing set.

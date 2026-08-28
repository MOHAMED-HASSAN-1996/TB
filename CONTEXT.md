# TalkBridge Context

## Purpose
Real-time voice + video translation for professional meetings (Upwork use case).

## Architecture (REVISED — no WebRTC)
The previous version tried to relay raw audio/video between browsers via WebRTC
peer connections. That path was unreliable (TURN/NAT, broken peers, no audible
translated voice). We REMOVED WebRTC media entirely.

Now each participant's browser does everything LOCALLY:
1. **Capture** audio locally — either the mic (`getUserMedia`) or a tab/system
   audio stream (`getDisplayMedia`, the "Tab Audio" button).
2. **Speech-to-Text** — mic uses the free in-browser Web Speech API; tab audio is
   recorded with `MediaRecorder` and sent to the free `/api/stt` endpoint (HuggingFace
   Whisper, no key; Groq Whisper fallback when `GROQ_API_KEY` is set).
3. **Translate** — client-side free providers (`composables/useVoiceTranslator.ts`):
   MyMemory (CORS, uses the user's own IP so no shared-IP quota issue) then HF
   NLLB-200 distilled (200 languages, free). Server-side `translationProvider.ts`
   still exists for non-browser callers.
4. **Speak** — `window.speechSynthesis` in the LISTENER's own target language.

Only the final recognized TEXT is relayed to other participants over the existing
WebSocket signaling channel (`/api/...` + `/_ws`). Each receiver then translates +
speaks the text in their own language. This is why every user hears a translated
voice + sees a live transcript in THEIR language, with zero WebRTC.

## Key Logic
- Each participant: { socketId, name, language (speaks), targetLanguage (hears) }.
- "You hear translations in" is chosen on the landing/join page and saved to
  `localStorage['talkbridge-target-lang']` so a returning user's language persists.
- Audio is NEVER sent between peers — only text. No TURN, no STUN, no peer relay.
- Remote tiles are listeners (presence only); the translated voice is produced
  locally by each browser via `speechSynthesis`.

## Files
- `composables/useVoiceTranslator.ts` — the new core (capture → STT → translate → speak).
- `composables/languages.ts` — shared language registry (flags, RTL, names).
- `composables/useSocket.ts` — WebSocket signaling (presence + text relay only).
- `pages/room/[code].vue` — room UI (mic/tab buttons, live transcript, listeners).
- `pages/index.vue`, `pages/join/[code].vue` — landing + join with lang pickers.
- `server/api/stt.post.ts` — free Whisper STT for captured tab audio.
- `server/routes/_ws.ts` — WS hub: join-room, text-chunk relay, presence. `rtc-signal`
  is kept for backward compat but no longer used by the client.
- `server/utils/translationProvider.ts`, `transcribe.ts`, `tts.ts` — free providers.

## Free Stack
- Translation: MyMemory (default, CORS) + HuggingFace NLLB-200 (free, no key).
- STT: Web Speech API (mic) + HF Whisper via `/api/stt` (tab audio).
- TTS: browser `speechSynthesis` (free, no network for playback).
- Signaling: WebSocket (`/_ws`) — works on Node hosts and Cloudflare Workers.
- No paid keys required. Optional `HF_API` / `GROQ_API_KEY` only raise rate limits.

## Known limitations
- Web Speech Recognition works best in Chrome/Edge (Safari/Firefox limited).
- "Tab Audio" needs Chrome + the user must tick "Share tab audio" in the picker.
- `speechSynthesis` voice availability depends on the OS/browser installed voices.
- Browser autoplay policy: audio plays after the user interacts (clicking a button).

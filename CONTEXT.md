# TalkBridge Context

## Purpose
Real-time voice + video translation for professional meetings (Upwork use case).

## Architecture (REVISED — Node host + SERVER is translation/TTS authority)
The previous versions tried (a) WebRTC media relay (broken) and then (b) a fully
client-side browser pipeline (Web Speech STT → client MyMemory translate →
`speechSynthesis` TTS), with the Cloudflare Worker just relaying text. That
client-only path was unreliable: `speechSynthesis` voice availability varies and
produced no reliable output, and server Edge TTS couldn't run on the Worker.

**Current model requires a persistent Node host (Render/Glitch/Koyeb — NOT
Cloudflare Workers), because the server now owns translation + voice synthesis:**

1. **Capture** (local) — mic (`getUserMedia`) via Web Speech API, or tab/system
   audio (`getDisplayMedia`).
2. **Speech-to-Text** — Web Speech API (Chrome/Edge) with a MediaRecorder → `/api/stt`
   (HF Whisper, free) fallback for browsers without it (Safari/Firefox).
3. **Translate** — the SERVER (`server/utils/translationProvider.ts`) translates
   each received text into every listener's `targetLanguage`. Provider chain:
   MyMemory (fast, no key) → HuggingFace NLLB-200 / opus-mt (the "HF model") →
   Google → Groq. MyMemory first for reliability/speed.
4. **Speak** — the SERVER synthesizes the translated text with `node-edge-tts`
   (Microsoft Edge free TTS, runs on Node) and sends the mp3 `audioBase64` to each
   listener. Client plays the clip reliably; `speechSynthesis` is only a last-resort
   fallback when the server returns no audio.

Each `text-chunk` from a speaker does:
- broadcast `transcript-update` {chunkId, originalText, speakerLang, speakerName} (immediate display)
- for each OTHER participant, server translates to their `targetLanguage`, Edge-TTS
  the result, and `sendTo` them `translated-audio` {chunkId, audioBase64, translatedText, ...}.
- client matches `chunkId` to update the transcript with the translation + plays audio.
No double-speak, no raw-audio relay between peers.

## Deployment (critical)
`render.yaml` + `Dockerfile` target a free **Node** host. Must build with the
`node-server` preset (default `npm run build`) and run `node .output/server/index.mjs`.
`node-edge-tts` uses Node `fs`/`tmpdir` → **does not run on Cloudflare Workers**.
The old Worker (`talkbridge`) can no longer produce server audio.

## Key Logic
- Each participant: { socketId, name, language (speaks), targetLanguage (hears) }.
- "You hear translations in" is chosen on landing/join and saved to
  `localStorage['talkbridge-target-lang']`.
- Audio between peers is server-generated TTS per listener — reliable in any language.
- `_ws.ts` handlers: `join-room`, `text-chunk` (translate+TTS), `chat`, `leave-room`,
  `video-frame` (currently disabled to avoid flood), `rtc-signal` (legacy unused).

## Files
- `server/routes/_ws.ts` — WS hub; `text-chunk` = translate + TTS per listener, sends
  `transcript-update` + `translated-audio` (+ `chunkId` for client matching).
- `server/utils/tts.ts` — `node-edge-tts` → base64 mp3 (voice per 2-letter lang). Node-only.
- `server/utils/translationProvider.ts` — translateText chain (MyMemory → HF NLLB → Google → Groq).
- `server/utils/transcribe.ts` + `server/api/stt.post.ts` — HF Whisper STT (mic fallback + tab audio).
- `composables/useVoiceTranslator.ts` — STT capture (Web Speech + `/api/stt` fallback), local TTS fallback.
- `composables/useSocket.ts` — WebSocket signaling + JSON actions.
- `pages/room/[code].vue` — room UI; `handleRemoteText` (display original) + `handleTranslatedAudio`
  (update translation + play server audio), manual text input for demo.
- `pages/index.vue`, `pages/join/[code].vue` — landing + join with lang pickers.
- `render.yaml`, `Dockerfile` — free Node host deploy.

## UI / design (2026-08 port)
- Premium dark+light design ported from the reference React app (now removed — `اساسي صوت - Copy`
  was deleted after the port). Brand accent `#FF4D00` (orange gradients), glass cards
  (`rounded-[28px]/[32px]`, `backdrop-blur`, `border-white/10`), Arabic RTL, IBM Plex Sans Arabic.
- `tailwind.config.js` sets `darkMode: 'class'` + brand color. Default theme follows OS (dark default),
  toggleable via header button / `useTheme`.
- 3-page flow (verified live): `pages/index.vue` = full premium landing (hero w/ live conversation
  demo card, how-it-works 3 steps, features grid 01→06, language strip, CTA "إنشاء غرفة" + join-by-code
  modal, footer, dark toggle) → `/room/[code]` setup card (name + languages + "ابدأ" + invite) → active
  room. Join page routes into `/room/[code]` with `?name&lang&targetLang` query.
- VibeCurb reviewed = a skills library whose core taste constraints match the `frontend-design` skill
  (distinctive palette/typography/signature, avoid AI-slop defaults) — applied to the landing redesign.
- Landing CTA: creates `/room/[code]` (random code) with `?name&lang&targetLang&provider=auto`; join
  modal routes to `/join/[code]`. Camera+mic auto-start on room join via `getUserMedia`. Camera fix +
  clean `/join/[code]` invite + bottom toggle live.

## Verified (local Node server, Playwright 2-user)
- Room/journey test on `node .output/server/index.mjs`:
  - Host A `/room/[code]` + invitee B `/join/[code]` both join (2 مشارك).
  - Both directions deliver `transcript-update` (original) then `translated-audio`
    with a real server translation AND `audioBase64` (Edge TTS mp3) that the client
    plays. Verified A→B ("مساء الخير أصدقائي" → "Good evening, friends!" + audio)
    and B→A ("اهلا بك" → "YEAH,HI." + audio, MyMemory quality).
  - Translation now MyMemory-first (`translationProvider.ts`) so it never stalls on
    HF cold starts; HF NLLB remains the model fallback.
- The old "other party gets nothing" bug was fixed at the relay + provider level.
- Deployed worker `talkbridge` (Cloudflare) is legacy and can NO LONGER do server
  audio — deploy to Render instead (see Architecture + render.yaml).

## Free Stack
- Translation: **SERVER** MyMemory (default) + HuggingFace NLLB-200 / opus-mt (free, no key) + Google + Groq.
- STT: Web Speech API (mic) + HF Whisper via `/api/stt` (all browsers, fallback).
- TTS: `node-edge-tts` (Microsoft Edge free TTS on Node) → mp3 per listener; `speechSynthesis` fallback.
- Signaling: WebSocket (`/_ws`) — persistent Node host required.
- No paid keys required. Optional `HF_API` / `GROQ_API_KEY` only raise rate limits / speed.

## Known limitations
- Server TTS runs on Node only → deploy to a Node host (Render/Glitch/Koyeb), not Cloudflare Workers.
- Web Speech Recognition works best in Chrome/Edge (Safari/Firefox use the Whisper `/api/stt` fallback).
- MyMemory phrasing can be rough for short greetings; HF NLLB/Google give better quality when reachable.
- Browser autoplay policy: audio plays after a user interaction (clicking a button).

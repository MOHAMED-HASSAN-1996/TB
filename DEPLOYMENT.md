# TalkBridge — Free, Self-Hosted Voice Meeting Translator

Real-time **voice + video** meeting translator. Each participant speaks in their own
language; the other hears a translated **voice** (Edge TTS) plus a live transcript.
No paid API keys required — translation runs on free HuggingFace / LibreTranslate,
STT runs in-browser (Web Speech API) or on free HuggingFace Whisper, and the video
call is peer-to-peer WebRTC (free STUN).

## What changed (free stack)
- **Translation**: replaced the paid OpenRouter LLM with a free layer
  (`server/utils/translationProvider.ts`) that prefers HuggingFace NLLB-200 (any model
  id via `HF_MODEL`) and falls back to LibreTranslate. The app never breaks if a call fails.
- **WebRTC video**: added real peer-to-peer video (`composables/useWebRTC.ts`,
  `components/VideoTile.vue`, signaling in `server/plugins/socket.ts`). Camera/mic
  toggle buttons in the room header.
- **STT**: kept the free in-browser Web Speech API; added an optional server-side
  HuggingFace Whisper path (`server/utils/transcribe.ts`).

## Quick start (local)
```bash
npm install
cp .env.example .env      # optional — runs free with nothing set
npm run dev               # http://localhost:3000
```
Open two browsers (or two devices) → create a meeting → share the link → join.

> Note: camera/mic and WebRTC need `https://` or `localhost`. For LAN testing use
> `localhost` on both, or deploy (below) for real remote meetings.

## Deploy for FREE (replaces Railway)
You do NOT need Railway. Pick one:

### Option A — Render (easiest, free tier)
1. Push this repo to GitHub.
2. New → Web Service → connect repo.
3. Build: `npm install && npm run build`. Start: `node .output/server/index.mjs`
   (Nuxt 3 outputs a Nitro server; set "Node" environment).
4. Add the optional env vars from `.env.example` (leave blank to stay free).
5. Done. Render gives you a `https://...onrender.com` URL with working WebRTC.

### Option B — HuggingFace Spaces (free, has GPU option)
- HF Spaces runs Docker/static. Put the built `output` behind a Dockerfile, or use
  Spaces' "Docker" template with `CMD node .output/server/index.mjs`.
- Best for the **translation/STT models** (HF Inference) — they're native here.

### Option C — Oracle Cloud Always-Free (24/7, zero cost forever)
- Spin up an `VM.Standard.E2.1.Micro` (free). Install Node, run
  `npm run build && node .output/server/index.mjs` behind Caddy/Nginx for HTTPS.
- Free forever; great for a permanent TURN + signaling host if you add coturn.

### Optional: your own LibreTranslate (free, Docker)
```bash
docker run -p 5000:5000 libretranslate/libretranslate
```
Then set `LIBRETRANSLATE_URL=http://your-host:5000` for faster, private translation.

## Environment variables (all optional)
See `.env.example`. With nothing set the app still works fully free:
- Translation → public HuggingFace NLLB-200 / LibreTranslate.
- STT → in-browser Web Speech API.
- Video → Google public STUN.

## How the pipeline works
```
speaker talks ──► browser STT (free) ──► text
                                      │
                         socket 'text-chunk' ──► server
                                      │
                         translate (HF NLLB / LibreTranslate, free)
                                      │
                         TTS (Edge TTS, free) ──► base64 audio
                                      │
                         socket 'translated-audio' ──► listener hears translation
```
Video/audio call itself is separate, peer-to-peer WebRTC (no server bandwidth cost).

## Files of interest
- `server/utils/translationProvider.ts` — free translation core (HF + LibreTranslate).
- `server/utils/transcribe.ts` — server-side Whisper (optional free STT).
- `server/utils/tts.ts` — Edge TTS (free).
- `composables/useWebRTC.ts` — peer-to-peer video signaling client.
- `server/plugins/socket.ts` — Socket.IO + WebRTC signal relay + translation fan-out.

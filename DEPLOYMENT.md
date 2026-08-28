# TalkBridge — Free Deployment (No Credit Card)

TalkBridge has **no WebRTC** anymore. Each browser captures audio locally
(mic or tab audio), translates it, and speaks the result with the built-in
`speechSynthesis` API — so there is no peer-to-peer media to relay. Only short
**text** messages cross the network (over a WebSocket for presence + relay).

That means it deploys to **any** static/Node host — including Vercel, which does
NOT support WebRTC but is perfect for this text-only signaling model.

## Recommended: Vercel (zero config)
```bash
npm i -g vercel
vercel            # detect Nuxt, deploy
```
- The Nuxt server (Nitro) runs as a serverless/edge function; `/_ws` WebSocket
  works on Vercel's Node functions. Text relay + `/api/stt` both work.
- No env vars needed. Optional: `HF_API`, `GROQ_API_KEY` to raise rate limits.

## Cloudflare Workers (free, always-on)
```bash
npx wrangler login
npm run deploy:cf
```
WebSocket signaling is pinned to a Durable Object (`$DurableObject`).

## Node host (HF Spaces, Zeabur, Koyeb, Railway)
```bash
npm run build
node .output/server/index.mjs
```
Set `PORT` if the host requires it (HF Spaces uses `7860`).

## Env (all optional / free)
- `HF_API` — free HuggingFace token (raises NLLB + Whisper rate limits).
- `GROQ_API_KEY` — free Groq key; fast Whisper STT fallback for tab audio.
- `HF_MODEL` — NLLB model id (default `facebook/nllb-200-distilled-600M`).

No paid keys required. The app runs fully free with nothing set.

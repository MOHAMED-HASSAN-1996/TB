# TalkBridge — Free Deployment (No Credit Card)

Signaling uses **SSE** (not WebSocket), so it runs on any free Node host that
keeps a process alive — no credit card needed. The app is already configured
to read `process.env.PORT` and bind to the host, so it works on all options
below with zero code changes.

**Recommended (Asian / non-traditional, zero card): [Zeabur Free Plan](#1-zeabur-recommended)**

---

## 1. Zeabur (Recommended)

Singapore-based PaaS (like Render/Railway but Asia-focused). Free plan is
**$0/month, NO credit card**. Runs Nuxt as a full container, so SSE/EventSource
signaling has NO per-request timeout — it behaves like a real server.

### Steps
1. Go to https://zeabur.com → sign up (GitHub login) → Free plan.
2. Dashboard → **Create Project** → **Deploy service** → **Deploy from source code (Git)**.
3. Import your GitHub repo `MOHAMED-HASSAN-1996/TB`.
4. Zeabur auto-detects Nuxt. In the service **Variables** tab add:
   - `SERVER_PRESET=zeabur`
   - (optional) `HF_API`, `TRANSLATION_PROVIDER=auto`, etc.
5. Zeabur gives you a free subdomain like `https://tb-xxxxx.zeabur.app` with HTTPS.
6. `zbpack.json` is already in the repo (build + start commands).

### Notes
- Free plan auto-sleeps on inactivity and cold-starts on next request (accepted).
- WebRTC needs HTTPS — Zeabur provides it automatically.

---

## 2. HuggingFace Spaces (older option — Docker tier is now paid)

### Steps
1. Go to https://huggingface.co/spaces (logged in as `mh0390052`).
2. Click **Create new Space**.
   - Owner: `MOHAMED-HASSAN-1996` (or your account)
   - Space name: `talkbridge`
   - **SDK: Docker** → **Dockerfile** (the repo has a `Dockerfile` already)
   - **Visibility: Public**
   - Plan: **Free**
3. On the next screen choose **Connect a Git repo** → pick `MOHAMED-HASSAN-1996/TB`
   (this repo). HF will build & deploy automatically.
4. Wait ~3–5 min for the build. The Space URL will be:
   `https://MOHAMED-HASSAN-1996-talkbridge.hf.space` (or your namespace).

## Optional env vars (Settings → Variables)
- `HF_API` — free HuggingFace token (raises translation limits)
- `HF_MODEL` — `facebook/nllb-200-distilled-600M` (default; any HF model works)
- `TRANSLATION_PROVIDER` — `auto` (default)

## Notes
- First load may take ~30s (HF free tier cold start). Reload once.
- Camera/mic need `https://` — HF Spaces provides it automatically.
- For 24/7 always-on, upgrade the Space or use Oracle Cloud Always-Free.

---

## 3. Koyeb (zero card, web service, sleeps much less)

Koyeb's Hobby plan is free with **no credit card** and runs a 512 MB web
service (Docker container). It stays awake far longer than Render/Zeabur free
tiers and supports long-lived SSE connections.

1. Go to https://koyeb.com → sign up (GitHub login) → free Hobby plan.
2. **Create Service** → select your GitHub repo → **Docker** (or auto-detect).
3. Build command: `npm install && npm run build`
4. Run command: `node .output/server/index.mjs`
5. Expose **port 3000** (set `PORT=3000` if asked) → get an HTTPS URL.
6. No code changes needed (`nuxt.config.ts` reads `process.env.PORT`, binds host).

---

## Local dev
```bash
npm install
npm run dev   # http://localhost:3000
```

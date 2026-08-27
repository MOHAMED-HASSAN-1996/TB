# TalkBridge — Free Deployment on HuggingFace Spaces

No credit card required. Works on the free tier because signaling uses SSE (not WebSocket).

## Steps
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

## Local dev
```bash
npm install
npm run dev   # http://localhost:3000
```

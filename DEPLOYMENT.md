# TalkBridge — Free Deployment (No Credit Card)

Signaling uses a **WebSocket** (Nitro/crossws) on a **Durable Object**, so it
runs on Cloudflare Workers — the internet's free, never-sleeping edge — with
**zero servers to babysit**, no credit card, and no idle timeout. This is the
**recommended** path.

**Recommended: [Cloudflare Workers](#cloudflare-workers-recommended)**

---

## Cloudflare Workers (Recommended)

Cloudflare's free plan is $0/month, no credit card, no sleep. WebSocket
signaling is pinned to a single Durable Object (`$DurableObject`), so all peers
in a room share state and cross-peer messaging works — even though Workers are
otherwise stateless.

### Prerequisites
- Node 20+ (wrangler is already a devDependency).
- A Cloudflare account (free) — https://dash.cloudflare.com/sign-up

### Steps
1. Log in to wrangler:
   ```bash
   npm run postinstall   # ensures nuxt prepare ran
   npx wrangler login    # opens browser, authorizes your Cloudflare account
   ```
2. Build + deploy with the `cloudflare-durable` preset (Auto-merges
   `wrangler.jsonc` → `dist/server/wrangler.json` with the Durable Object):
   ```bash
   npm run deploy:cf
   ```
   Wrangler prints a live `*.workers.dev` URL with HTTPS. WebRTC works there.

3. (Optional) Preview locally before deploying:
   ```bash
   npm run preview:cf   # nuxt build + `wrangler dev --local`
   ```

### What the setup includes
- `wrangler.jsonc` — Worker name, `$DurableObject` binding + migration.
- `nuxt.config.ts` → `nitro.cloudflare.deployConfig: true` — carries the
  wrangler config into the build.
- `scripts/cf.mjs` — cross-platform build/deploy (`NITRO_PRESET=cloudflare-durable`).
- `package.json` — `build:cf`, `preview:cf`, `deploy:cf`, wrangler devDep.

### Env vars (all optional / free-tier defaults)
Set these via `npx wrangler secret put <NAME>` or the dashboard:
- `HF_API` — free HuggingFace token (raises translation/STT rate limits)
- `TRANSLATION_PROVIDER` — `auto` (default) | `hf` | `libretranslate`
- `LIBRETRANSLATE_URL` — self-hosted LibreTranslate URL (optional)

Translation & TTS calls are outbound HTTPS from the Worker — no paid keys needed.

### Notes
- Free subdomain `https://talkbridge.<you>.workers.dev` (HTTPS → WebRTC OK).
- The Worker + Durable Object are always on — no cold starts for signaling.
- Durable Objects free tier: 1M+ requests/month included.
- After your first `wrangler deploy`, you can also wire it to a custom domain.

---

## Alternative Node hosts (still valid for self-hosting)

If you'd rather run a long-lived Node server you control, the same code works
with `npm run build && node .output/server/index.mjs`. Options:

### 1. Zeabur (Asia-focused PaaS)
Singapore-based, free plan, no credit card. Auto-detects Nuxt.

### 2. HuggingFace Spaces (Docker - now paid tier)
Use only if you accept the paid Docker tier; the repo's `Dockerfile` is ready.

### 3. Koyeb (zero card, web service)
Koyeb Hobby is free no-card. `npm run build` then `node .output/server/index.mjs`.

---

## Local dev
```bash
npm install
npm run dev   # http://localhost:3000
```

export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  modules: ['@nuxtjs/tailwindcss'],
  runtimeConfig: {
    // Secrets available only server-side.
    // NONE of these are required to run for free. Leave blank to use the
    // zero-cost path: browser STT + LibreTranslate/HF free tier.
    groqApiKey: process.env.GROQ_API_KEY || '',
    // Optional: HuggingFace token raises free-tier rate limits (still free).
    hfApi: process.env.HF_API || '',
    // Any HF translation model id — default NLLB-200 distilled (200 languages, free).
    hfModel: process.env.HF_MODEL || 'facebook/nllb-200-distilled-600M',
    // Any HF Whisper STT model id.
    hfSttModel: process.env.HF_STT_MODEL || 'openai/whisper-large-v3-turbo',
    // 'auto' | 'hf' | 'libretranslate'
    translationProvider: process.env.TRANSLATION_PROVIDER || 'auto',
    // Self-hosted LibreTranslate URL (optional). Blank => use HF free tier / public instance.
    libreTranslateUrl: process.env.LIBRETRANSLATE_URL || '',
    public: {
      socketUrl: process.env.NUXT_PUBLIC_SOCKET_URL || '',
      // Public STUN/TURN servers for WebRTC (free).
      iceServers: process.env.NUXT_PUBLIC_ICE_SERVERS
        ? JSON.parse(process.env.NUXT_PUBLIC_ICE_SERVERS)
        : [
            { urls: 'stun:stun.l.google.com:19302' },
            { urls: 'stun:stun1.l.google.com:19302' }
          ]
    }
  },
  nitro: {
    // Listen on the port provided by the host (HF Spaces sets $PORT=7860).
    port: Number(process.env.PORT) || 3000,
    host: true
  }
})

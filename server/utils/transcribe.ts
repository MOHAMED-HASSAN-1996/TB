/**
 * Speech-to-Text for TalkBridge.
 *
 * FREE by default: uses a HuggingFace Whisper model via the Inference API
 * (no key needed for the public free tier; optional HF_API token raises the rate limit).
 *
 * If GROQ_API_KEY is set (still free tier available), it can be used as a fast fallback.
 *
 * The browser also has a built-in free STT (Web Speech API) used by ActiveListener.vue;
 * this server-side transcribe is for when you want server-side accuracy (e.g. Whisper large)
 * or the browser STT isn't available (Firefox/Safari).
 */

export async function processAudioBuffer(base64Audio: string): Promise<{ text: string; language?: string }> {
  const config = useRuntimeConfig();

  // Strip data: prefix if present
  const base64Data = base64Audio.replace(/^data:audio\/\w+;codecs=[^;]+;base64,/, '').replace(/^data:audio\/\w+;base64,/, '');

  const hfApi = config.hfApi || '';
  const hfSttModel = config.hfSttModel || 'openai/whisper-large-v3-turbo';
  const groqKey = config.groqApiKey || '';

  // 1) Try HuggingFace Whisper (free)
  try {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (hfApi) headers['Authorization'] = `Bearer ${hfApi}`;
    const res: any = await $fetch(`https://api-inference.huggingface.co/models/${hfSttModel}`, {
      method: 'POST',
      headers,
      body: { inputs: base64Data },
      timeout: 30000
    });
    const text = typeof res === 'string' ? res : (res?.text || '');
    if (text && text.trim()) return { text: text.trim() };
  } catch (e) {
    console.error('[STT] HF Whisper failed:', (e as any)?.message || e);
  }

  // 2) Fallback to Groq Whisper (free tier) if key present
  if (groqKey) {
    try {
      const buf = Buffer.from(base64Data, 'base64');
      const form = new FormData();
      form.append('file', new Blob([buf], { type: 'audio/webm' }), 'audio.webm');
      form.append('model', 'whisper-large-v3-turbo');
      form.append('response_format', 'json');
      const res: any = await $fetch('https://api.groq.com/openai/v1/audio/transcriptions', {
        method: 'POST',
        headers: { Authorization: `Bearer ${groqKey}` },
        body: form,
        timeout: 30000
      });
      const text = res?.text || '';
      if (text && text.trim()) return { text: text.trim() };
    } catch (e) {
      console.error('[STT] Groq fallback failed:', (e as any)?.message || e);
    }
  }

  return { text: '' };
}

/**
 * TalkBridge — Free translation layer.
 *
 * 100% free providers (no paid keys required):
 *   - HuggingFace Inference API: Helsinki-NLP/opus-mt-* for language pairs that
 *     involve English (highly reliable on the free tier, no gating), and the
 *     configured HF_MODEL (default NLLB-200) only for non-English <-> non-English
 *     pairs. A free HF_API token raises rate limits but is optional.
 *   - LibreTranslate: used if LIBRETRANSLATE_URL is configured (self-hosted/free).
 *   - Fallback: original text so the call never breaks.
 */

// Our 2-letter codes -> codes HF/Helsinki understand.
const HF_CODE: Record<string, string> = {
  ar: 'ar', en: 'en', fr: 'fr', es: 'es', de: 'de',
  zh: 'zh', hi: 'hi', pt: 'pt', ru: 'ru', tr: 'tr',
  it: 'it', ja: 'ja', ko: 'ko', nl: 'nl', pl: 'pl'
};

// NLLB-200 FLORES codes (used only when we fall back to the multi-lingual model).
const NLLB_CODE: Record<string, string> = {
  ar: 'arb_Arab', en: 'eng_Latn', fr: 'fra_Latn', es: 'spa_Latn', de: 'deu_Latn',
  zh: 'zho_Hans', hi: 'hin_Deva', pt: 'por_Latn', ru: 'rus_Cyrl', tr: 'tur_Latn',
  it: 'ita_Latn', ja: 'jpn_Jpan', ko: 'kor_Hang', nl: 'nld_Latn', pl: 'pol_Latn'
};

// code -> English display name (used by the optional Virtual Buddy).
const LANGUAGE_NAMES: Record<string, string> = {
  ar: 'Arabic', en: 'English', fr: 'French', es: 'Spanish', de: 'German',
  zh: 'Chinese', hi: 'Hindi', pt: 'Portuguese', ru: 'Russian', tr: 'Turkish',
  it: 'Italian', ja: 'Japanese', ko: 'Korean', nl: 'Dutch', pl: 'Polish'
};

export async function translateText(text: string, sourceLang: string, targetLang: string, provider?: string): Promise<string> {
  if (!text || !text.trim()) return text;
  if (sourceLang === targetLang) return text;

  const config = useRuntimeConfig();
  const effectiveProvider = (provider && provider !== 'auto') ? provider : (config.translationProvider || 'auto');
  const hfApi = config.hfApi || '';
  const hfModel = config.hfModel || 'facebook/nllb-200-distilled-600M';
  const ltUrl = (config.libreTranslateUrl || '').replace(/\/$/, '');

  const tryHf = effectiveProvider === 'hf' || effectiveProvider === 'auto';
  const tryLt = effectiveProvider === 'libretranslate' || (!!ltUrl && effectiveProvider === 'auto');

  // Fast, reliable, no-key path first so calls don't stall on cold model loads.
  try {
    return await translateViaMyMemory(text, sourceLang, targetLang);
  } catch (e) {
    console.error('[translate] MyMemory failed, trying next:', (e as any)?.message || e);
  }

  if (tryHf) {
    try {
      const out = await translateViaHf(text, sourceLang, targetLang, hfModel, hfApi);
      if (out && out.trim() && out.trim() !== text.trim()) return out;
      console.error('[translate] HF returned unchanged/empty text, trying next option');
    } catch (e) {
      console.error('[translate] HF failed, falling back:', (e as any)?.message || e, 'status=', (e as any)?.statusCode);
    }
  }

  if (tryLt) {
    try {
      return await translateViaLibre(text, sourceLang, targetLang, ltUrl);
    } catch (e) {
      console.error('[translate] LibreTranslate failed, falling back:', (e as any)?.message || e);
    }
  }

  // Reliable free fallback: Google's public translate endpoint (no key).
  try {
    return await translateViaGoogle(text, sourceLang, targetLang);
  } catch (e) {
    console.error('[translate] Google failed, falling back:', (e as any)?.message || e);
  }

  // Groq (LLaMA) — fast, free, reliable server-side translation.
  try {
    return await translateViaGroq(text, sourceLang, targetLang);
  } catch (e) {
    console.error('[translate] Groq failed:', (e as any)?.message || e);
  }

  return text;
}

async function translateViaGroq(text: string, src: string, tgt: string): Promise<string> {
  const config = useRuntimeConfig();
  const groqKey = config.groqApiKey || '';
  if (!groqKey) throw new Error('No GROQ_API_KEY configured');

  const srcName = LANGUAGE_NAMES[src] || src;
  const tgtName = LANGUAGE_NAMES[tgt] || tgt;

  const res: any = await $fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${groqKey}`,
      'Content-Type': 'application/json'
    },
    body: {
      model: 'llama-3.1-8b-instant',
      messages: [
        { role: 'system', content: `You are a professional translator. Translate the user's text from ${srcName} to ${tgtName}. Return ONLY the translated text, nothing else.` },
        { role: 'user', content: text }
      ],
      temperature: 0.0,
      max_tokens: 1024
    },
    timeout: 15000
  });

  const out = res?.choices?.[0]?.message?.content;
  if (out && String(out).trim()) return String(out).trim();
  throw new Error('Groq returned no translation');
}

async function translateViaGoogle(text: string, src: string, tgt: string): Promise<string> {
  const s = (HF_CODE[src] || 'en').split('-')[0];
  const t = (HF_CODE[tgt] || 'en').split('-')[0];
  const res: any = await $fetch('https://translate.googleapis.com/translate_a/single', {
    method: 'GET',
    query: { client: 'gtx', sl: s, tl: t, dt: 't', q: text },
    timeout: 15000,
    retry: 1
  });
  // Response shape: [[["translated","original",...],...],...]
  const out = res?.[0]?.[0]?.[0];
  if (out && String(out).trim()) return String(out).trim();
  throw new Error('Google returned no translation');
}

async function translateViaMyMemory(text: string, src: string, tgt: string): Promise<string> {
  const s = (HF_CODE[src] || 'en').split('-')[0];
  const t = (HF_CODE[tgt] || 'en').split('-')[0];
  const res: any = await $fetch('https://api.mymemory.translated.net/get', {
    method: 'GET',
    query: { q: text, langpair: `${s}|${t}` },
    timeout: 15000
  });
  const out = res?.responseData?.translatedText || res?.translatedText;
  if (out && out.trim() && !/MYMEMORY WARNING/i.test(out)) return String(out).trim();
  throw new Error('MyMemory returned no translation');
}

async function translateViaLibre(text: string, src: string, tgt: string, url: string): Promise<string> {
  const res: any = await $fetch(`${url}/translate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: { q: text, source: HF_CODE[src] || 'en', target: HF_CODE[tgt] || 'en', format: 'text' },
    timeout: 15000
  });
  return res?.translatedText?.trim() || text;
}

async function translateViaHf(text: string, src: string, tgt: string, hfModel: string, token: string) {
  const headers: any = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  else headers['x-use-cache'] = 'false';

  // English-involving pairs: Helsinki-NLP/opus-mt-{src}-{tgt} is the most
  // reliable free option (no model gating, fast cold start).
  const usesHelsinki = src === 'en' || tgt === 'en';
  let modelUrl: string;
  let body: any;

  if (usesHelsinki && src !== tgt) {
    const s = HF_CODE[src] || 'en';
    const t = HF_CODE[tgt] || 'en';
    modelUrl = `https://api-inference.huggingface.co/models/Helsinki-NLP/opus-mt-${s}-${t}`;
    body = { inputs: text };
  } else {
    // Non-English <-> non-English: use the configured multilingual model (NLLB).
    modelUrl = `https://api-inference.huggingface.co/models/${hfModel}`;
    body = {
      inputs: text,
      parameters: {
        src_lang: NLLB_CODE[src] || 'eng_Latn',
        tgt_lang: NLLB_CODE[tgt] || 'eng_Latn'
      }
    };
  }

  const res: any = await $fetch(modelUrl, {
    method: 'POST',
    headers,
    body,
    timeout: 60000, // first call may wait for the model to load
    retry: 2,
    retryDelay: 3000
  });

  // HuggingFace returns several shapes: string | [{translation_text}] | {translation_text} | {generated_text}
  if (typeof res === 'string') { const v = (res as string).trim(); if (v) return v; }
  if (Array.isArray(res)) {
    const f = res[0];
    if (f?.translation_text) return String(f.translation_text).trim();
    if (f?.generated_text) return String(f.generated_text).trim();
    if (typeof f === 'string' && (f as string).trim()) return (f as string).trim();
  }
  if (res?.translation_text) return String(res.translation_text).trim();
  if (res?.generated_text) return String(res.generated_text).trim();
  throw new Error('No translation returned from HF');
}

export { LANGUAGE_NAMES };

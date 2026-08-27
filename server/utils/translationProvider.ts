/**
 * TalkBridge — Free translation layer.
 *
 * Replaces the paid OpenRouter/LLM call with 100% free providers:
 *   1. LibreTranslate (self-hosted or public free instance) — fast, offline-capable.
 *   2. HuggingFace Inference API — free tier, no key, using NLLB-200 (200 languages)
 *      or ANY HF model id you paste into HF_MODEL (e.g. facebook/nllb-200-distilled-600M,
 *      facebook/mbart-large-50-many-to-many-mmt, Helsinki-NLP/opus-mt-ar-en, ...).
 *
 * Priority: if HF_API (token) is set we prefer HF (best quality, any model). Otherwise
 * LibreTranslate. If both fail we fall back to the original text so the call never breaks.
 */

// Language code the providers understand.
const LIBRE_CODE: Record<string, string> = {
  ar: 'ar', en: 'en', fr: 'fr', es: 'es', de: 'de',
  zh: 'zh', hi: 'hi', pt: 'pt', ru: 'ru', tr: 'tr',
  it: 'it', ja: 'ja', ko: 'ko', nl: 'nl', pl: 'pl'
};

const LANGUAGE_NAMES: Record<string, string> = {
  ar: 'Arabic', en: 'English', fr: 'French', es: 'Spanish', de: 'German',
  zh: 'Chinese', hi: 'Hindi', pt: 'Portuguese', ru: 'Russian', tr: 'Turkish',
  it: 'Italian', ja: 'Japanese', ko: 'Korean', nl: 'Dutch', pl: 'Polish'
};

function libreSrc(lang: string) { return LIBRE_CODE[lang] || 'en'; }
// LibreTranslate target is the same 2-letter code (NLLB/mbart use different, but LT keeps it simple).
function libreTgt(lang: string) { return LIBRE_CODE[lang] || 'en'; }

// NLLB-200 uses FLORES-200 codes; map our 2-letter codes to NLLB codes.
const NLLB_CODE: Record<string, string> = {
  ar: 'arb_Arab', en: 'eng_Latn', fr: 'fra_Latn', es: 'spa_Latn', de: 'deu_Latn',
  zh: 'zho_Hans', hi: 'hin_Deva', pt: 'por_Latn', ru: 'rus_Cyrl', tr: 'tur_Latn',
  it: 'ita_Latn', ja: 'jpn_Jpan', ko: 'kor_Hang', nl: 'nld_Latn', pl: 'pol_Latn'
};

export async function translateText(text: string, sourceLang: string, targetLang: string, provider?: string): Promise<string> {
  if (!text || !text.trim()) return text;
  if (sourceLang === targetLang) return text;

  const config = useRuntimeConfig();
  // Per-room provider overrides the global default when supplied.
  const effectiveProvider = (provider && provider !== 'auto') ? provider : (config.translationProvider || 'auto');
  const hfApi = config.hfApi || '';
  const hfModel = config.hfModel || 'facebook/nllb-200-distilled-600M';
  const ltUrl = (config.libreTranslateUrl || '').replace(/\/$/, '');

  // Decide which provider to try.
  // Priority for 'auto': HuggingFace (works WITHOUT a key on the free tier) first,
  // then any configured LibreTranslate, then the original text.
  const tryHf = effectiveProvider === 'hf' || effectiveProvider === 'auto';
  const tryLt = effectiveProvider === 'libretranslate' || (!!ltUrl && effectiveProvider === 'auto');

  if (tryHf) {
    try {
      return await translateViaHf(text, sourceLang, targetLang, hfModel, hfApi);
    } catch (e) {
      console.error('[translate] HF failed, falling back:', (e as any)?.message || e);
    }
  }

  if (tryLt) {
    try {
      return await translateViaLibre(text, sourceLang, targetLang, ltUrl);
    } catch (e) {
      console.error('[translate] LibreTranslate failed, falling back:', (e as any)?.message || e);
    }
  }

  return text; // never break the call (still shows original text)
}

async function translateViaLibre(text: string, src: string, tgt: string, url: string): Promise<string> {
  const res: any = await $fetch(`${url}/translate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: {
      q: text,
      source: libreSrc(src),
      target: libreTgt(tgt),
      format: 'text'
    },
    timeout: 15000
  });
  return res?.translatedText?.trim() || text;
}

async function translateViaHf(text, src, tgt, model, token) {
  const res = await $fetch(`https://api-inference.huggingface.co/models/${model}`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: {
      inputs: text,
      parameters: {
        src_lang: NLLB_CODE[src] || 'eng_Latn',
        tgt_lang: NLLB_CODE[tgt] || 'eng_Latn'
      }
    },
    timeout: 20000
  });

  // HF returns either a string, [{translation_text}], or {translation_text}
  if (typeof res === 'string') return res.trim();
  if (Array.isArray(res) && res[0]?.translation_text) return res[0].translation_text.trim();
  if (res?.translation_text) return res.translation_text.trim();
  // some NLLB setups echo the pair; ignore if identical
  throw new Error('No translation returned from HF');
}

export { LANGUAGE_NAMES };

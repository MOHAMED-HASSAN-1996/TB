import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { randomUUID } from 'node:crypto';
import { readFile, unlink } from 'node:fs/promises';

/**
 * Free server-side TTS via Microsoft Edge's online voice service
 * (node-edge-tts, no API key). Runs on any Node host.
 *
 * NOTE: requires a Node runtime (fs/tmpdir) — does NOT run on Cloudflare
 * Workers. Pair with speechSynthesis as a client-side fallback.
 */

// Voice per 2-letter lang. Best-quality neural voices for our supported set.
export const VOICES: Record<string, string> = {
  ar: 'ar-SA-HamedNeural',
  en: 'en-US-JennyNeural',
  es: 'es-ES-ElviraNeural',
  fr: 'fr-FR-DeniseNeural',
  de: 'de-DE-KatjaNeural',
  zh: 'zh-CN-XiaoxiaoNeural',
  ja: 'ja-JP-NanamiNeural',
  ko: 'ko-KR-SunHiNeural',
  hi: 'hi-IN-SwaraNeural',
  pt: 'pt-BR-FranciscaNeural',
  ru: 'ru-RU-SvetlanaNeural',
  tr: 'tr-TR-EmelNeural',
  it: 'it-IT-ElsaNeural'
};

const LANG_FULL: Record<string, string> = {
  ar: 'ar-SA', en: 'en-US', es: 'es-ES', fr: 'fr-FR', de: 'de-DE',
  zh: 'zh-CN', ja: 'ja-JP', ko: 'ko-KR', hi: 'hi-IN', pt: 'pt-BR',
  ru: 'ru-RU', tr: 'tr-TR', it: 'it-IT'
};

// Cache the lazily-imported class to avoid reload cost.
let EdgeTTSMod: any = null;
async function getEdgeTTS() {
  if (!EdgeTTSMod) EdgeTTSMod = await import('node-edge-tts');
  return EdgeTTSMod.EdgeTTS;
}

/**
 * Synthesize `text` into spoken audio in `targetLang` and return it as base64
 * (mp3). Throws on failure — caller should fall back to client speechSynthesis.
 */
export async function generateTTS(text: string, targetLang: string): Promise<string> {
  const lang = (targetLang || 'en').split('-')[0];
  const voice = VOICES[lang] || VOICES.en;
  const full = LANG_FULL[lang] || 'en-US';
  const tempFilePath = join(tmpdir(), `${randomUUID()}.mp3`);

  const EdgeTTS = await getEdgeTTS();
  const tts = new EdgeTTS({
    voice,
    lang: full,
    outputFormat: 'audio-24khz-48kbitrate-mono-mp3',
    timeout: 30000
  });

  try {
    await tts.ttsPromise(text, tempFilePath);
    const audioBuffer = await readFile(tempFilePath);
    await unlink(tempFilePath).catch(() => {});
    return audioBuffer.toString('base64');
  } catch (error) {
    await unlink(tempFilePath).catch(() => {});
    throw error;
  }
}

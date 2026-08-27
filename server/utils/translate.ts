/**
 * Translation facade for TalkBridge.
 *
 * All expensive translation now goes through the FREE layer in translationProvider.ts
 * (LibreTranslate + HuggingFace NLLB-200 / any HF model). No paid keys required.
 *
 * The chat-bot helpers (generateBotReply / generateBotGreeting) are kept for the
 * optional "Virtual Buddy" mode but now they ALSO use the free translation layer so the
 * app never depends on a paid LLM. If both parties are real humans, these are never called.
 */

import { translateText as freeTranslate, LANGUAGE_NAMES } from './translationProvider';

export async function translateText(text: string, sourceLang: string, targetLang: string, provider?: string): Promise<string> {
  return freeTranslate(text, sourceLang, targetLang, provider);
}

// Optional casual "buddy" — uses the free translation layer so it stays zero-cost.
// (Replaced the old paid LLM call. It produces a short friendly translated phrase.)
export async function generateBotReply(inputText: string, targetLang: string = 'English'): Promise<string> {
  try {
    const translated = await freeTranslate(inputText, 'auto', normalize(targetLang));
    return translated || "I couldn't quite hear that over the connection.";
  } catch {
    return "I'm having a little trouble connecting right now.";
  }
}

export async function generateBotGreeting(targetLang: string = 'English'): Promise<string> {
  try {
    const greet = 'Hello! I am your Virtual Buddy. Please speak and I will translate.';
    return await freeTranslate(greet, 'en', normalize(targetLang));
  } catch {
    return 'Hello! I am here to help you practice translation.';
  }
}

function normalize(langName: string): string {
  const entry = Object.entries(LANGUAGE_NAMES).find(([, v]) => v.toLowerCase() === langName.toLowerCase());
  return entry ? entry[0] : 'en';
}

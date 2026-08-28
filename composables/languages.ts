// Shared language registry for TalkBridge (used by landing, join, and room pages).
// Mirrors the design source: 13 languages, native names, RTL support.
export interface LangMeta {
  code: string;
  name: string;        // English name
  nativeName: string;   // Name in its own language
  flag: string;
  rtl: boolean;
  ttsCode: string;      // BCP-47 hint for speechSynthesis
}

export const LANGUAGES: Record<string, LangMeta> = {
  ar: { code: 'ar', name: 'Arabic', nativeName: 'العربية', flag: '🇸🇦', rtl: true, ttsCode: 'ar-EG' },
  en: { code: 'en', name: 'English', nativeName: 'English', flag: '🇺🇸', rtl: false, ttsCode: 'en-US' },
  es: { code: 'es', name: 'Spanish', nativeName: 'Español', flag: '🇪🇸', rtl: false, ttsCode: 'es-ES' },
  fr: { code: 'fr', name: 'French', nativeName: 'Français', flag: '🇫🇷', rtl: false, ttsCode: 'fr-FR' },
  de: { code: 'de', name: 'German', nativeName: 'Deutsch', flag: '🇩🇪', rtl: false, ttsCode: 'de-DE' },
  zh: { code: 'zh', name: 'Chinese', nativeName: '中文', flag: '🇨🇳', rtl: false, ttsCode: 'zh-CN' },
  ja: { code: 'ja', name: 'Japanese', nativeName: '日本語', flag: '🇯🇵', rtl: false, ttsCode: 'ja-JP' },
  ko: { code: 'ko', name: 'Korean', nativeName: '한국어', flag: '🇰🇷', rtl: false, ttsCode: 'ko-KR' },
  hi: { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', flag: '🇮🇳', rtl: false, ttsCode: 'hi-IN' },
  pt: { code: 'pt', name: 'Portuguese', nativeName: 'Português', flag: '🇧🇷', rtl: false, ttsCode: 'pt-BR' },
  ru: { code: 'ru', name: 'Russian', nativeName: 'Русский', flag: '🇷🇺', rtl: false, ttsCode: 'ru-RU' },
  tr: { code: 'tr', name: 'Turkish', nativeName: 'Türkçe', flag: '🇹🇷', rtl: false, ttsCode: 'tr-TR' },
  it: { code: 'it', name: 'Italian', nativeName: 'Italiano', flag: '🇮🇹', rtl: false, ttsCode: 'it-IT' }
};

export const RTL_LANGS = ['ar', 'he', 'ur', 'fa', 'yi'];

export const DEFAULT_LANG = 'en';

export function isRtl(lang: string): boolean {
  return RTL_LANGS.includes(lang);
}

export function getLang(code: string): LangMeta {
  return LANGUAGES[code] || LANGUAGES.en;
}

export function detectBrowserLanguage(): string {
  try {
    const lang = navigator.language.split('-')[0].toLowerCase();
    return LANGUAGES[lang] ? lang : 'en';
  } catch (e) {
    return 'en';
  }
}

export const BRAND = '#FF4D00';

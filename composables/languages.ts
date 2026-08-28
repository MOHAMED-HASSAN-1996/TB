// Shared language registry for TalkBridge (used by landing, join, and room pages).
export const LANGUAGES: Record<string, { name: string; flag: string; native: string }> = {
  ar: { name: 'Arabic', flag: '🇸🇦', native: 'العربية' },
  en: { name: 'English', flag: '🇺🇸', native: 'English' },
  fr: { name: 'French', flag: '🇫🇷', native: 'Français' },
  es: { name: 'Spanish', flag: '🇪🇸', native: 'Español' },
  de: { name: 'German', flag: '🇩🇪', native: 'Deutsch' },
  zh: { name: 'Chinese', flag: '🇨🇳', native: '中文' },
  hi: { name: 'Hindi', flag: '🇮🇳', native: 'हिन्दी' },
  pt: { name: 'Portuguese', flag: '🇧🇷', native: 'Português' },
  ru: { name: 'Russian', flag: '🇷🇺', native: 'Русский' },
  tr: { name: 'Turkish', flag: '🇹🇷', native: 'Türkçe' },
  it: { name: 'Italian', flag: '🇮🇹', native: 'Italiano' },
  ja: { name: 'Japanese', flag: '🇯🇵', native: '日本語' },
  ko: { name: 'Korean', flag: '🇰🇷', native: '한국어' },
  nl: { name: 'Dutch', flag: '🇳🇱', native: 'Nederlands' },
  pl: { name: 'Polish', flag: '🇵🇱', native: 'Polski' }
};

export const RTL_LANGS = ['ar', 'he', 'ur', 'fa', 'yi'];

export const DEFAULT_LANG = 'en';

export function isRtl(lang: string): boolean {
  return RTL_LANGS.includes(lang);
}

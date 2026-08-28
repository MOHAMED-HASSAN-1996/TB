import { ref } from 'vue';

const isDark = ref(true);

export function useTheme() {
  function apply(dark: boolean) {
    isDark.value = dark;
    if (import.meta.client) {
      const root = document.documentElement;
      if (dark) root.classList.add('dark');
      else root.classList.remove('dark');
      localStorage.setItem('talkbridge-theme', dark ? 'dark' : 'light');
    }
  }

  function toggle() {
    apply(!isDark.value);
  }

  function init() {
    if (!import.meta.client) return;
    const saved = localStorage.getItem('talkbridge-theme');
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    apply(saved ? saved === 'dark' : prefersDark);
  }

  return { isDark, toggle, apply, init };
}

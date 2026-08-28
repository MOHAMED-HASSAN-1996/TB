<template>
  <div class="font-sans antialiased min-h-screen selection:bg-[#FF4D00] selection:text-white bg-[#F7F7F5] dark:bg-[#080808] text-gray-900 dark:text-white">
    <Head>
      <Link rel="preconnect" href="https://fonts.googleapis.com" />
      <Link href="/fonts/IBMPlexSansArabic-Regular.ttf" rel="preload" as="font" type="font/ttf" crossorigin="anonymous" />
    </Head>
    <NuxtPage />
  </div>
</template>

<script setup>
import { onMounted } from 'vue';

function applyTheme(dark) {
  const root = document.documentElement;
  if (dark) root.classList.add('dark');
  else root.classList.remove('dark');
}

onMounted(() => {
  const saved = localStorage.getItem('talkbridge-theme');
  const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  const dark = saved ? saved === 'dark' : prefersDark;
  applyTheme(dark);
  window.addEventListener('storage', (e) => {
    if (e.key === 'talkbridge-theme') applyTheme(localStorage.getItem('talkbridge-theme') === 'dark');
  });
});
</script>

<style>
@font-face {
  font-family: 'IBM Plex Sans Arabic';
  src: url('/fonts/IBMPlexSansArabic-Light.ttf') format('truetype');
  font-weight: 300;
  font-style: normal;
}
@font-face {
  font-family: 'IBM Plex Sans Arabic';
  src: url('/fonts/IBMPlexSansArabic-Regular.ttf') format('truetype');
  font-weight: 400;
  font-style: normal;
}
@font-face {
  font-family: 'IBM Plex Sans Arabic';
  src: url('/fonts/IBMPlexSansArabic-Medium.ttf') format('truetype');
  font-weight: 500;
  font-style: normal;
}
@font-face {
  font-family: 'IBM Plex Sans Arabic';
  src: url('/fonts/IBMPlexSansArabic-SemiBold.ttf') format('truetype');
  font-weight: 600;
  font-style: normal;
}
@font-face {
  font-family: 'IBM Plex Sans Arabic';
  src: url('/fonts/IBMPlexSansArabic-Bold.ttf') format('truetype');
  font-weight: 700;
  font-style: normal;
}

html {
  font-family: 'IBM Plex Sans Arabic', sans-serif;
  transition: background-color 0.3s ease, color 0.3s ease;
}
html.dark { background-color: #080808; color: #fff; }
html:not(.dark) { background-color: #F7F7F5; color: #111; }

::-webkit-scrollbar { width: 6px; height: 6px; }
::-webkit-scrollbar-track { background: transparent; }
::-webkit-scrollbar-thumb { background: #374151; border-radius: 3px; }
::-webkit-scrollbar-thumb:hover { background: #4b5563; }

html.dark select option { background-color: #1f2937; color: #fff; }
</style>

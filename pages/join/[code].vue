<template>
  <div class="min-h-screen flex flex-col bg-[#080808] selection:bg-[#FF4D00] selection:text-white relative overflow-hidden">
    <div class="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
      <div class="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-[#FF4D00] opacity-[0.15] rounded-full blur-[120px] animate-pulse"></div>
      <div class="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-[#8B2B00] opacity-[0.15] rounded-full blur-[120px]"></div>
    </div>

    <div class="max-w-md mx-auto px-4 flex-1 flex flex-col items-center justify-center text-center w-full">
      <div class="w-12 h-12 rounded-xl bg-[#121212] flex items-center justify-center border border-[#1E1E1E] shadow-[0_0_20px_rgba(255,77,0,0.1)] mb-6">
        <svg class="w-6 h-6 text-[#FF4D00]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
      </div>
      <h1 class="text-3xl font-extrabold text-white mb-2 tracking-tighter">انضم للاجتماع</h1>
      <p class="text-[#737373] text-sm mb-8">كود الغرفة: <span class="font-mono text-[#FF4D00] font-bold">{{ code }}</span></p>

      <div class="w-full bg-[#121212] border border-[#1E1E1E] rounded-[28px] p-6 shadow-lg">
        <input v-model="userName" type="text" placeholder="اسمك" dir="rtl"
               class="w-full px-5 py-4 bg-[#080808] border border-[#1E1E1E] rounded-2xl text-base font-bold text-white placeholder-gray-400 focus:outline-none focus:border-[#FF4D00] focus:ring-1 focus:ring-[#FF4D00] transition-all mb-4" />

        <div class="grid grid-cols-2 gap-3 mb-5">
          <div class="relative">
            <select v-model="myLanguage" dir="rtl" class="w-full pl-4 pr-10 py-3.5 rounded-2xl border border-[#1E1E1E] bg-[#080808] text-white focus:outline-none focus:ring-1 focus:ring-[#FF4D00] font-bold appearance-none cursor-pointer text-sm">
              <option v-for="(meta, c) in languages" :key="c" :value="c">{{ meta.nativeName }}</option>
            </select>
            <svg class="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A3A3A3] pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/></svg>
            <span class="absolute -top-2 right-3 px-1 text-[10px] text-gray-500 bg-[#121212]">تتكلم</span>
          </div>
          <div class="relative">
            <select v-model="myTargetLanguage" dir="rtl" class="w-full pl-4 pr-10 py-3.5 rounded-2xl border border-[#1E1E1E] bg-[#080808] text-white focus:outline-none focus:ring-1 focus:ring-[#FF4D00] font-bold appearance-none cursor-pointer text-sm">
              <option v-for="(meta, c) in languages" :key="c" :value="c">{{ meta.nativeName }}</option>
            </select>
            <svg class="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A3A3A3] pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/></svg>
            <span class="absolute -top-2 right-3 px-1 text-[10px] text-gray-500 bg-[#121212]">تسمع</span>
          </div>
        </div>

        <button @click="joinMeeting" :disabled="!isValid || isLoading"
                class="w-full flex items-center justify-center gap-2 px-6 py-4 bg-[#FF4D00] hover:bg-[#e64500] text-white rounded-2xl text-base font-bold shadow-lg shadow-[#FF4D00]/20 transition-all">
          <span v-if="!isLoading">انضم للاجتماع</span>
          <svg v-if="isLoading" class="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path></svg>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { LANGUAGES, detectBrowserLanguage } from '~/composables/languages';

const router = useRouter();
const route = useRoute();
const code = String(route.params.code || '').toUpperCase();
const userName = ref('');
const myLanguage = ref('en');
const myTargetLanguage = ref('en');
const isLoading = ref(false);
const languages = LANGUAGES;
const isValid = computed(() => userName.value.trim().length >= 2);

onMounted(() => {
  myLanguage.value = detectBrowserLanguage();
  try { const s = localStorage.getItem('talkbridge-target-lang'); if (s && LANGUAGES[s]) myTargetLanguage.value = s; } catch (e) {}
});

const joinMeeting = async () => {
  if (!isValid.value) return;
  isLoading.value = true;
  try { localStorage.setItem('talkbridge-target-lang', myTargetLanguage.value); } catch (e) {}
  await new Promise(r => setTimeout(r, 300));
  router.push({
    path: `/room/${code}`,
    query: { name: userName.value.trim(), lang: myLanguage.value, targetLang: myTargetLanguage.value, provider: 'auto' }
  });
};
</script>

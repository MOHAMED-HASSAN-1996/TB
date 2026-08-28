<template>
  <div class="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-4 sm:p-6 font-sans relative overflow-hidden">
    <div class="fixed top-[-20%] left-[-10%] w-[50%] h-[50%] bg-blue-600/15 blur-[180px] rounded-full mix-blend-screen pointer-events-none"></div>

    <div class="w-full max-w-md relative z-10 animate-in fade-in zoom-in duration-500">
      <div class="text-center mb-6">
        <div class="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-blue-500 to-violet-600 rounded-xl shadow-[0_0_30px_rgba(59,130,246,0.3)] mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a2 2 0 01-2-2V6a2 2 0 012-2h8z"/>
          </svg>
        </div>
        <h1 class="text-2xl font-bold text-white mb-1">Join Meeting</h1>
        <p class="text-gray-500 text-sm">Enter your details to join the conversation</p>
        <p class="text-gray-600 text-xs mt-2 font-mono">Code: {{ code }}</p>
      </div>

      <div class="bg-[#111111]/90 backdrop-blur-xl border border-[#1f1f1f] rounded-2xl p-6 shadow-2xl relative overflow-hidden">
        <div class="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-blue-500 to-violet-500"></div>

        <div class="mb-5">
          <label class="block text-[11px] font-bold text-gray-500 mb-1.5 uppercase tracking-widest">Your Name</label>
          <input v-model="userName" type="text" placeholder="Enter your name"
                 class="w-full bg-[#0a0a0a] border border-[#1f1f1f] rounded-xl px-4 py-2.5 text-white text-sm placeholder-gray-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50 transition outline-none" />
        </div>

        <div class="mb-5">
          <label class="block text-[11px] font-bold text-gray-500 mb-1.5 uppercase tracking-widest">Your Language (you speak)</label>
          <div class="relative">
            <select v-model="myLanguage" class="w-full bg-[#0a0a0a] border border-[#1f1f1f] rounded-xl px-4 py-2.5 text-white text-sm appearance-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50 transition cursor-pointer pr-10">
              <option v-for="(meta, c) in languages" :key="c" :value="c">{{ meta.flag }} {{ meta.native }} · {{ meta.name }}</option>
            </select>
            <svg class="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/></svg>
          </div>
        </div>

        <div class="mb-6">
          <label class="block text-[11px] font-bold text-gray-500 mb-1.5 uppercase tracking-widest">You hear translations in</label>
          <div class="relative">
            <select v-model="myTargetLanguage" class="w-full bg-[#0a0a0a] border border-[#1f1f1f] rounded-xl px-4 py-2.5 text-white text-sm appearance-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50 transition cursor-pointer pr-10">
              <option v-for="(meta, c) in languages" :key="c" :value="c">{{ meta.flag }} {{ meta.native }} · {{ meta.name }}</option>
            </select>
            <svg class="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/></svg>
          </div>
        </div>

        <button @click="joinMeeting" :disabled="!isValid || isLoading"
                class="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold py-3 rounded-xl shadow-[0_0_25px_rgba(59,130,246,0.3)] hover:shadow-[0_0_35px_rgba(59,130,246,0.5)] transition-all text-sm flex items-center justify-center gap-2">
          <span v-if="!isLoading">Join Meeting</span>
          <svg v-if="isLoading" class="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path></svg>
        </button>
      </div>

      <p class="text-center text-gray-600 text-[11px] mt-4">No account needed. Works in any browser.</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { LANGUAGES } from '~/composables/languages';

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
  try {
    const browserLang = navigator.language.split('-')[0].toLowerCase();
    if (LANGUAGES[browserLang]) myLanguage.value = browserLang;
    const saved = localStorage.getItem('talkbridge-target-lang');
    if (saved && LANGUAGES[saved]) myTargetLanguage.value = saved;
  } catch (e) {}
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

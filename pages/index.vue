<template>
  <div class="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-4 sm:p-6 font-sans relative overflow-hidden">
    <!-- Ambient Background -->
    <div class="fixed top-[-20%] left-[-10%] w-[60%] h-[60%] bg-violet-600/15 blur-[180px] rounded-full mix-blend-screen pointer-events-none"></div>
    <div class="fixed bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-blue-600/10 blur-[150px] rounded-full mix-blend-screen pointer-events-none"></div>

    <div class="w-full max-w-md relative z-10">
      <!-- Logo & Title -->
      <div class="text-center mb-8">
        <div class="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-violet-500 to-fuchsia-600 rounded-2xl shadow-[0_0_40px_rgba(124,58,237,0.35)] mb-5">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-7 w-7 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" x2="12" y1="19" y2="22"/>
          </svg>
        </div>
        <h1 class="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mb-2">TalkBridge</h1>
        <p class="text-gray-400 text-sm sm:text-base max-w-xs mx-auto leading-relaxed">Speak your language. Everyone hears theirs — translated voice + live text. No installs, 100% free.</p>
      </div>

      <!-- Main Card -->
      <div class="bg-[#111111]/90 backdrop-blur-xl border border-[#1f1f1f] rounded-2xl p-6 sm:p-7 shadow-2xl relative overflow-hidden">
        <div class="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-violet-500 via-fuchsia-500 to-violet-500"></div>

        <!-- Name -->
        <div class="mb-5">
          <label class="block text-[11px] font-bold text-gray-500 mb-1.5 uppercase tracking-widest">Your Name</label>
          <input v-model="userName" type="text" placeholder="Enter your name"
                 class="w-full bg-[#0a0a0a] border border-[#1f1f1f] rounded-xl px-4 py-2.5 text-white text-sm placeholder-gray-600 focus:border-violet-500 focus:ring-1 focus:ring-violet-500/50 transition outline-none" />
        </div>

        <!-- Language -->
        <div class="mb-5">
          <label class="block text-[11px] font-bold text-gray-500 mb-1.5 uppercase tracking-widest">Your Language (you speak)</label>
          <div class="relative">
            <select v-model="myLanguage" class="w-full bg-[#0a0a0a] border border-[#1f1f1f] rounded-xl px-4 py-2.5 text-white text-sm appearance-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500/50 transition cursor-pointer pr-10">
              <option v-for="(meta, code) in languages" :key="code" :value="code">{{ meta.flag }} {{ meta.native }} · {{ meta.name }}</option>
            </select>
            <svg class="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/></svg>
          </div>
        </div>

        <!-- Hear in -->
        <div class="mb-6">
          <label class="block text-[11px] font-bold text-gray-500 mb-1.5 uppercase tracking-widest">You hear translations in</label>
          <div class="relative">
            <select v-model="myTargetLanguage" class="w-full bg-[#0a0a0a] border border-[#1f1f1f] rounded-xl px-4 py-2.5 text-white text-sm appearance-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500/50 transition cursor-pointer pr-10">
              <option v-for="(meta, code) in languages" :key="code" :value="code">{{ meta.flag }} {{ meta.native }} · {{ meta.name }}</option>
            </select>
            <svg class="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/></svg>
          </div>
          <p v-if="myLanguage === myTargetLanguage" class="text-[11px] text-gray-500 mt-1.5">Same as your language — you'll only see the transcript, no re-speaking.</p>
        </div>

        <!-- Create Button -->
        <button @click="createMeeting" :disabled="!isValid || isLoading"
                class="w-full bg-violet-600 hover:bg-violet-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold py-3 rounded-xl shadow-[0_0_25px_rgba(124,58,237,0.3)] hover:shadow-[0_0_35px_rgba(124,58,237,0.5)] transition-all text-sm flex items-center justify-center gap-2">
          <span v-if="!isLoading">Create Meeting</span>
          <svg v-if="isLoading" class="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path></svg>
          <svg v-if="!isLoading" xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3"/></svg>
        </button>

        <!-- Divider -->
        <div class="flex items-center gap-3 my-5">
          <div class="flex-1 h-px bg-[#1f1f1f]"></div>
          <span class="text-[10px] text-gray-600 uppercase tracking-widest font-semibold">or join</span>
          <div class="flex-1 h-px bg-[#1f1f1f]"></div>
        </div>

        <!-- Join by Code -->
        <div class="flex gap-2">
          <input v-model="joinCode" placeholder="Paste meeting code"
                 class="flex-1 bg-[#0a0a0a] border border-[#1f1f1f] rounded-xl px-4 py-2.5 text-gray-200 text-sm outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500/50 transition" />
          <button @click="joinByCode" :disabled="!joinCode.trim()"
                  class="bg-[#1a1a1a] hover:bg-[#222] border border-[#2a2a2a] disabled:opacity-40 text-white font-bold px-5 rounded-xl text-sm transition-colors">Join</button>
        </div>
      </div>

      <p class="text-center text-gray-600 text-[11px] mt-5">100% free · Mic or any tab audio · Chrome works best</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { LANGUAGES } from '~/composables/languages';

const router = useRouter();
const userName = ref('');
const myLanguage = ref('ar');
const myTargetLanguage = ref('en');
const joinCode = ref('');
const isLoading = ref(false);

const languages = LANGUAGES;

const isValid = computed(() => userName.value.trim().length >= 2);

onMounted(() => {
  try {
    const browserLang = navigator.language.split('-')[0].toLowerCase();
    if (LANGUAGES[browserLang]) myLanguage.value = browserLang;
  } catch (e) {}
});

const generateCode = () => Math.random().toString(36).substring(2, 8).toUpperCase();

const createMeeting = async () => {
  if (!isValid.value) return;
  isLoading.value = true;
  // Save this user's preferred hear-language so future visits remember it.
  try { localStorage.setItem('talkbridge-target-lang', myTargetLanguage.value); } catch (e) {}
  await new Promise(r => setTimeout(r, 300));
  router.push({
    path: `/room/${generateCode()}`,
    query: { name: userName.value.trim(), lang: myLanguage.value, targetLang: myTargetLanguage.value, provider: 'auto' }
  });
};

const joinByCode = () => {
  const code = joinCode.value.trim().toUpperCase();
  if (code) router.push(`/join/${code}`);
};
</script>

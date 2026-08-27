<template>
  <div class="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-6 font-sans relative overflow-hidden">
    <!-- Ambient Background Effects -->
    <div class="fixed top-[-20%] left-[-10%] w-[50%] h-[50%] bg-violet-600/20 blur-[150px] rounded-full mix-blend-screen pointer-events-none"></div>

    <div class="w-full max-w-lg relative z-10 animate-in fade-in zoom-in duration-500">
      <div class="bg-[#141414]/80 backdrop-blur-xl border border-[#1f1f1f] rounded-3xl p-8 shadow-2xl relative overflow-hidden group">
        <div class="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-blue-500 to-violet-500 opacity-80"></div>
        
        <div class="text-center mb-8">
            <div class="inline-flex items-center justify-center w-16 h-16 bg-[#1f1f1f] rounded-full shadow-inner mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z"/></svg>
            </div>
            <h1 class="text-2xl font-bold text-white mb-2">You've been invited to join a Meeting</h1>
            <p class="text-gray-400 text-sm">No account needed. Just enter your name and select your language to join instantly.</p>
        </div>

        <div class="space-y-6">
            <div>
              <label class="block text-sm font-semibold text-gray-400 mb-2 uppercase tracking-wide">Your Name</label>
              <input v-model="userName" type="text" placeholder="e.g. John Doe" 
                     class="w-full bg-[#0a0a0a] border border-[#1f1f1f] rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition outline-none" />
            </div>
            
            <div>
              <label class="block text-sm font-semibold text-gray-400 mb-2 uppercase tracking-wide">Your Language</label>
              <select v-model="myLanguage" class="w-full bg-[#0a0a0a] border border-[#1f1f1f] rounded-xl px-4 py-3 text-white appearance-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition cursor-pointer">
                <option v-for="(name, code) in languageNames" :key="code" :value="code">
                  {{ flags[code] }} {{ name }}
                </option>
              </select>
            </div>

            <div>
              <label class="block text-sm font-semibold text-gray-400 mb-2 uppercase tracking-wide">Translation Engine (Free)</label>
              <select v-model="translationProvider" class="w-full bg-[#0a0a0a] border border-[#1f1f1f] rounded-xl px-4 py-3 text-white appearance-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition cursor-pointer">
                <option value="auto">Auto (HF NLLB-200 → LibreTranslate)</option>
                <option value="hf">HuggingFace model (best quality)</option>
                <option value="libretranslate">LibreTranslate (fastest)</option>
              </select>
            </div>

            <button @click="joinMeeting" :disabled="!isSetupValid || isLoading"
                  class="w-full mt-4 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-4 rounded-xl shadow-[0_0_20px_rgba(37,99,235,0.4)] hover:shadow-[0_0_30px_rgba(37,99,235,0.6)] transition-all flex items-center justify-center gap-3">
            <span v-if="!isLoading">Join Meeting Now</span>
            <svg v-if="isLoading" class="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRouter, useRoute } from 'vue-router';

const router = useRouter();
const route = useRoute();

const userName = ref('');
const myLanguage = ref('en'); // Default fallback
const isLoading = ref(false);
const translationProvider = ref('auto');

const flags = {
  'ar': '🇸🇦', 'en': '🇺🇸', 'fr': '🇫🇷', 'es': '🇪🇸', 'de': '🇩🇪',
  'zh': '🇨🇳', 'hi': '🇮🇳', 'pt': '🇧🇷', 'ru': '🇷🇺', 'tr': '🇹🇷'
};

const languageNames = {
  'ar': 'Arabic', 'en': 'English', 'fr': 'French', 'es': 'Spanish', 'de': 'German',
  'zh': 'Chinese', 'hi': 'Hindi', 'pt': 'Portuguese', 'ru': 'Russian', 'tr': 'Turkish'
};

const isSetupValid = computed(() => userName.value.trim().length >= 2 && myLanguage.value);

onMounted(() => {
    // Auto-Language Detection logic
    try {
        const browserLang = navigator.language.split('-')[0].toLowerCase();
        if (languageNames[browserLang]) {
            myLanguage.value = browserLang;
        }
    } catch (e) {
        console.warn("Could not detect browser language", e);
    }
});

const joinMeeting = async () => {
    if(!isSetupValid.value) return;
    isLoading.value = true;
    
    await new Promise(r => setTimeout(r, 800));
    
    router.push({
        path: `/room/${route.params.code}`,
        query: { name: userName.value.trim(), lang: myLanguage.value, targetLang: myLanguage.value, provider: translationProvider.value }
    });
};
</script>

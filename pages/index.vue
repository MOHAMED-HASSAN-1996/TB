<template>
  <div class="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-6 font-sans relative overflow-hidden">
    <!-- Ambient Background Effects -->
    <div class="fixed top-[-20%] left-[-10%] w-[50%] h-[50%] bg-violet-600/20 blur-[150px] rounded-full mix-blend-screen pointer-events-none"></div>
    <div class="fixed bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-blue-600/10 blur-[150px] rounded-full mix-blend-screen pointer-events-none"></div>

    <div class="w-full max-w-lg relative z-10">
      <div class="text-center mb-10">
        <div class="inline-flex items-center justify-center w-16 h-16 bg-violet-600 rounded-2xl shadow-[0_0_30px_rgba(124,58,237,0.3)] mb-6">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z"></path>
            <path d="M12 8v8"></path>
            <path d="M8 12h8"></path>
          </svg>
        </div>
        <h1 class="text-4xl lg:text-5xl font-extrabold text-white tracking-tight mb-4">TalkBridge</h1>
        <p class="text-gray-400 text-lg max-w-md mx-auto leading-relaxed">Cross-language professional voice meetings. Understand clients natively, instantly.</p>
      </div>

      <div class="bg-[#141414]/80 backdrop-blur-xl border border-[#1f1f1f] rounded-3xl p-8 shadow-2xl relative overflow-hidden group">
        <div class="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-violet-500 to-fuchsia-500 opacity-80"></div>
        
        <!-- Setup Profile Section -->
        <div class="mb-8">
          <div class="flex items-center gap-3 mb-6">
            <div class="w-8 h-8 rounded-full bg-violet-500/20 flex items-center justify-center border border-violet-500/30">
              <span class="text-violet-400 font-bold text-sm">1</span>
            </div>
            <h2 class="text-xl font-bold text-white">Your Profile</h2>
          </div>
          
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-semibold text-gray-400 mb-2 uppercase tracking-wide">Display Name</label>
              <input v-model="userName" type="text" placeholder="e.g. Alex" 
                     class="w-full bg-[#0a0a0a] border border-[#1f1f1f] rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition outline-none" />
            </div>
            
            <div>
              <label class="block text-sm font-semibold text-gray-400 mb-2 uppercase tracking-wide">My Language</label>
              <select v-model="myLanguage" class="w-full bg-[#0a0a0a] border border-[#1f1f1f] rounded-xl px-4 py-3 text-white appearance-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition cursor-pointer">
                <option v-for="(name, code) in languageNames" :key="code" :value="code">
                  {{ flags[code] }} {{ name }}
                </option>
              </select>
            </div>

            <div>
              <label class="block text-sm font-semibold text-gray-400 mb-2 uppercase tracking-wide">Translation Engine (Free)</label>
              <select v-model="translationProvider" class="w-full bg-[#0a0a0a] border border-[#1f1f1f] rounded-xl px-4 py-3 text-white appearance-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition cursor-pointer">
                <option value="auto">Auto (HF NLLB-200 → LibreTranslate)</option>
                <option value="hf">HuggingFace model (best quality)</option>
                <option value="libretranslate">LibreTranslate (fastest)</option>
              </select>
              <p class="text-xs text-gray-600 mt-2">All engines are 100% free. With HuggingFace you can plug in ANY model id (set <code>HF_MODEL</code> on the server).</p>
            </div>
          </div>
        </div>

        <!-- Action Section -->
        <div>
          <button @click="createMeeting" :disabled="!isSetupValid || isLoading"
                  class="w-full bg-violet-600 hover:bg-violet-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-4 rounded-xl shadow-[0_0_20px_rgba(124,58,237,0.4)] hover:shadow-[0_0_30px_rgba(124,58,237,0.6)] transition-all flex items-center justify-center gap-3 group/btn">
            <span v-if="!isLoading">Start a Meeting</span>
            <div v-if="!isLoading" class="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center group-hover/btn:translate-x-1 transition-transform">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"/></svg>
            </div>
            <svg v-if="isLoading" class="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
          </button>
        </div>
      </div>
      
      <!-- Join by Link Info -->
      <div class="mt-8 text-center text-gray-500 text-sm">
        <p>Client has an invite link? They can just paste it in their browser to join instantly.</p>
        <div class="mt-4 flex max-w-xs mx-auto gap-2">
            <input v-model="pastedLink" placeholder="Or paste link here..." class="flex-1 bg-transparent border-b border-gray-700 px-2 py-1 text-gray-300 outline-none focus:border-violet-500 text-sm text-center"/>
            <button v-if="pastedLink" @click="joinFromPasted" class="text-violet-400 font-bold hover:text-violet-300 text-sm">Join</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();

const userName = ref('');
const myLanguage = ref('ar');
const isLoading = ref(false);
const pastedLink = ref('');
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

const generateRoomCode = () => Math.random().toString(36).substring(2, 8).toUpperCase();

const createMeeting = async () => {
  if (!isSetupValid.value) return;
  isLoading.value = true;
  
  const finalCode = generateRoomCode();
  
  // Provide a short delay for animation
  await new Promise(r => setTimeout(r, 600));
  
  router.push({
    path: `/room/${finalCode}`,
    query: { name: userName.value.trim(), lang: myLanguage.value, targetLang: myLanguage.value, provider: translationProvider.value }
  });
};

const joinFromPasted = () => {
    let codeStr = pastedLink.value.trim();
    if(codeStr.includes('/')) {
        const parts = codeStr.split('/');
        codeStr = parts[parts.length-1];
    }
    if(codeStr) {
        router.push(`/join/${codeStr}`);
    }
}
</script>

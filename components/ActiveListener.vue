<template>
  <div class="relative flex flex-col items-center gap-3">
    <!-- Pulse Animation Ring -->
    <div class="absolute -inset-8 pointer-events-none">
      <div v-if="isActive" class="w-full h-full border-[1.5px] border-violet-500/50 rounded-full animate-ping opacity-20 duration-1000"></div>
    </div>
    <div class="absolute -inset-4 pointer-events-none">
      <div v-if="isActive" class="w-full h-full border border-violet-500/30 rounded-full animate-pulse opacity-40"></div>
    </div>

    <div 
      class="w-16 h-16 rounded-full flex items-center justify-center transition-all duration-300 relative z-10 shadow-[0_0_20px_rgba(124,58,237,0.4)]"
      :class="isActive ? 'bg-violet-600 scale-105' : 'bg-[#1a1a1a] border-2 border-gray-700'"
    >
      <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 transition-colors duration-200" :class="isActive ? 'text-white' : 'text-gray-400'" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
        <path stroke-linecap="round" stroke-linejoin="round" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
      </svg>
    </div>

    <!-- Live Preview Status -->
    <div class="flex flex-col items-center">
      <span class="text-xs font-bold tracking-widest uppercase transition-colors" :class="isActive ? 'text-violet-400' : 'text-gray-500'">
        {{ isActive ? 'Listening...' : 'Connecting...' }}
      </span>
      <span v-if="interimText" class="mt-2 text-sm text-gray-300 italic max-w-sm text-center truncate">
        "{{ interimText }}"
      </span>
    </div>

    <div v-if="errorMsg" class="text-xs text-red-400 mt-2 font-medium bg-red-400/10 px-3 py-1 rounded-full border border-red-400/20">
      {{ errorMsg }}
    </div>

    <!-- Fallback Manual Input -->
    <div class="mt-4 w-full px-4 sm:px-0">
      <input 
        v-model="manualText" 
        @keyup.enter="sendManualText"
        type="text" 
        placeholder="Or type here and press Enter..." 
        class="w-full bg-[#141414] border border-[#1f1f1f] rounded-xl px-4 py-2 text-sm text-white placeholder-gray-600 focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition outline-none" 
      />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue';

const props = defineProps({
  language: { type: String, required: true },
  isMuted: { type: Boolean, default: false }
});

const emit = defineEmits(['text-chunk']);

const isActive = ref(false);
const interimText = ref('');
const errorMsg = ref('');
const manualText = ref('');
let recognition = null;
let silenceTimer = null;

const sendManualText = () => {
    if (manualText.value.trim() !== '') {
        emit('text-chunk', manualText.value.trim());
        manualText.value = '';
    }
};

const langMap = {
  'ar': 'ar-SA',
  'en': 'en-US',
  'fr': 'fr-FR',
  'es': 'es-ES',
  'de': 'de-DE',
  'zh': 'zh-CN',
  'hi': 'hi-IN',
  'pt': 'pt-BR',
  'ru': 'ru-RU',
  'tr': 'tr-TR'
};

watch(() => props.isMuted, (muted) => {
  if (muted && recognition) {
    try { recognition.abort(); } catch(e) {} // Instantly drop captured bot audio
  } else if (!muted && recognition && isActive.value) {
    try { recognition.start(); } catch(e) {}
  }
});

const initSpeech = () => {
  const SpeechR = window.SpeechRecognition || window.webkitSpeechRecognition;
  
  if (!SpeechR) {
    errorMsg.value = 'Browser does not support Live Speech';
    return;
  }

  recognition = new SpeechR();
  recognition.continuous = true;
  recognition.interimResults = true;
  recognition.lang = langMap[props.language] || 'en-US';

  // Mobile optimization and standard
  recognition.maxAlternatives = 1;

  recognition.onstart = () => {
    isActive.value = true;
    errorMsg.value = '';
  };

  recognition.onerror = (e) => {
    if (e.error === 'no-speech' || e.error === 'aborted') {
      // Ignorable, restarts normally
    } else {
      errorMsg.value = `Mic error: ${e.error}`;
      if (e.error === 'not-allowed') isActive.value = false;
    }
  };

  recognition.onend = () => {
    // Autorestart logic for continuous loop
    if (isActive.value && errorMsg.value !== 'not-allowed' && !props.isMuted) {
       try { recognition.start(); } catch(e) {}
    }
  };

  recognition.onresult = (event) => {
    if (props.isMuted) return;

    let interim = '';
    let finalChunk = '';

    for (let i = event.resultIndex; i < event.results.length; i++) {
      const trans = event.results[i][0].transcript;
      if (event.results[i].isFinal) {
        finalChunk += trans;
      } else {
        interim += trans;
      }
    }

    interimText.value = interim || '';

    if (finalChunk.trim() !== '') {
      emit('text-chunk', finalChunk.trim()); // Emit complete sentence!
      
      // Auto-clear interim
      clearTimeout(silenceTimer);
      silenceTimer = setTimeout(() => { interimText.value = ''; }, 1000);
    }
  };

  try { recognition.start(); isActive.value = true; } catch(err) { console.error('Start error', err); }
};

onMounted(() => {
  initSpeech();
});

onUnmounted(() => {
  isActive.value = false;
  if (recognition) {
     recognition.stop();
  }
});
</script>

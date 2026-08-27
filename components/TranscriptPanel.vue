<template>
  <div class="flex flex-col h-full overflow-hidden bg-transparent">
    <div class="flex-1 overflow-y-auto p-5 space-y-5" ref="scrollContainer">
      <div v-if="transcripts.length === 0" class="h-full flex items-center justify-center text-gray-600 italic text-sm font-medium">
        Microphone idle. Feed connects when users speak.
      </div>
      
      <div v-for="(item, index) in transcripts" :key="index" class="flex flex-col gap-1.5 animate-in slide-in-from-right-4 fade-in duration-300">
        <span class="text-[11px] font-bold tracking-widest uppercase flex items-center gap-1.5" :class="item.isSelf ? 'text-violet-500 self-end -mr-1' : 'text-gray-500 ml-1'">
            <span>{{ FLAGS[item.speakerLanguage] || '🌐' }}</span>
            <span>{{ item.speakerName }}</span>
        </span>
        
        <div class="max-w-[85%] rounded-2xl px-4 py-3 shadow-md border" 
             :class="item.isSelf ? 'bg-violet-600 border-violet-500/50 text-white self-end rounded-br-none shadow-[0_5px_15px_rgba(124,58,237,0.15)]' : 'bg-[#1a1a1a] border-[#2a2a2a] text-gray-200 rounded-bl-none self-start shadow-black/40'">
          
          <div v-if="item.originalText" :dir="RTL_LANGS.includes(item.speakerLanguage) ? 'rtl' : 'ltr'" class="bubble-original" :class="item.isSelf ? 'text-violet-200 opacity-80' : ''">
             {{ item.originalText }}
          </div>
          
          <hr class="bubble-divider" v-if="!item.isSelf && item.translatedText && item.translatedText !== item.originalText" />
          
          <div v-if="!item.isSelf && item.translatedText && item.translatedText !== item.originalText" :dir="RTL_LANGS.includes(userTargetLang) ? 'rtl' : 'ltr'" class="bubble-translated">
             {{ item.translatedText }}
          </div>
          
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, nextTick } from 'vue';
const props = defineProps({ 
  transcripts: { type: Array, required: true },
  userTargetLang: { type: String, required: true } 
});
const scrollContainer = ref(null);

const FLAGS = {
  'ar': '🇸🇦', 'en': '🇺🇸', 'fr': '🇫🇷',
  'es': '🇪🇸', 'de': '🇩🇪', 'zh': '🇨🇳',
  'hi': '🇮🇳', 'pt': '🇧🇷', 'ru': '🇷🇺', 'tr': '🇹🇷'
};
const RTL_LANGS = ['ar', 'he', 'ur', 'fa'];

watch(() => props.transcripts, async () => {
  await nextTick();
  if (scrollContainer.value) scrollContainer.value.scrollTop = scrollContainer.value.scrollHeight;
}, { deep: true });
</script>

<style scoped>
.bubble-original {
  font-size: 0.75rem;
  opacity: 0.6;
  margin-bottom: 6px;
  font-style: italic;
}
.bubble-divider {
  border: none;
  border-top: 1px solid rgba(255,255,255,0.15);
  margin: 6px 0;
}
.bubble-translated {
  font-size: 0.875rem;
  font-weight: 500;
  color: white;
}
</style>

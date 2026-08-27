<template>
  <div class="relative flex flex-col items-center p-5 rounded-2xl shadow-xl overflow-hidden transition-all duration-300 transform" 
       :class="[gradientClass, isSpeaking ? 'ring-2 ring-violet-500 ring-offset-4 ring-offset-[#0a0a0a] scale-105' : 'border border-[#1f1f1f]']">
    
    <!-- Ripple animation -->
    <div v-if="isSpeaking" class="absolute inset-0 bg-white/5 animate-pulse pointer-events-none"></div>

    <div class="relative z-10 flex flex-col items-center gap-4 w-full">
      <div class="w-16 h-16 rounded-full bg-black/40 border border-white/20 backdrop-blur-md flex items-center justify-center text-white text-2xl font-bold shadow-lg transition-transform duration-200" :class="{'scale-110': isSpeaking}">
        {{ name.substring(0, 2).toUpperCase() }}
      </div>
      
      <div class="flex flex-col items-center w-full">
        <h3 class="text-white font-semibold text-lg truncate w-full text-center">{{ name }}</h3>
        
        <div class="flex items-center gap-1.5 mt-2 px-3 py-1 bg-black/30 rounded-full text-xs text-white border border-white/10 backdrop-blur-sm shadow-inner">
          <span>{{ flag }}</span>
          <span class="uppercase tracking-wider font-semibold opacity-90">{{ language }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  name: { type: String, required: true },
  language: { type: String, required: true },
  isSpeaking: { type: Boolean, default: false }
});

const languageStyles = {
  'Arabic': { gradient: 'bg-gradient-to-br from-emerald-900 to-[#141414]', flag: '🇸🇦' },
  'English': { gradient: 'bg-gradient-to-br from-blue-900 to-[#141414]', flag: '🇺🇸' },
  'French': { gradient: 'bg-gradient-to-br from-indigo-900 to-[#141414]', flag: '🇫🇷' },
  'Spanish': { gradient: 'bg-gradient-to-br from-amber-900 to-[#141414]', flag: '🇪🇸' },
  'German': { gradient: 'bg-gradient-to-br from-stone-800 to-[#141414]', flag: '🇩🇪' },
  'default:': { gradient: 'bg-gradient-to-br from-gray-800 to-[#141414]', flag: '🌐' }
};

const styleData = computed(() => languageStyles[props.language] || languageStyles['default:']);
const gradientClass = computed(() => styleData.value.gradient);
const flag = computed(() => styleData.value.flag);
</script>

<template>
  <div class="flex flex-col h-full overflow-hidden">
    <div class="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4" ref="scrollContainer">
      <div v-if="transcripts.length === 0" class="h-full flex items-center justify-center text-center px-6">
        <div class="flex flex-col items-center gap-2">
          <div class="w-12 h-12 rounded-2xl bg-[#FF4D00]/10 flex items-center justify-center">
            <svg class="h-6 w-6 text-[#FF4D00]" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"/></svg>
          </div>
          <p class="text-sm font-medium text-gray-400 dark:text-gray-500">سيظهر النص المترجم هنا عند تكلّم أحد الطرفين</p>
        </div>
      </div>

      <div v-for="(item, index) in transcripts" :key="index" class="flex flex-col gap-1.5 animate-fade-up" :style="{ animationDelay: index % 5 * 40 + 'ms' }">
        <span class="text-[11px] font-bold tracking-widest uppercase flex items-center gap-1.5" :class="item.isSelf ? 'text-[#FF4D00] self-end' : 'text-gray-400 dark:text-gray-500 ml-1'">
          <span>{{ LANGUAGES[item.speakerLanguage]?.flag || '🌐' }}</span>
          <span>{{ item.speakerName }}</span>
        </span>

        <div class="max-w-[85%] rounded-2xl px-4 py-3 shadow-md border"
             :class="item.isSelf
               ? 'bg-gradient-to-br from-[#FF4D00] to-[#ff7a40] border-[#FF4D00]/40 text-white self-end rounded-br-none shadow-[0_5px_15px_rgba(255,77,0,0.2)]'
               : 'bg-white dark:bg-[#1a1a1a] border-gray-200 dark:border-[#2a2a2a] text-gray-800 dark:text-gray-100 rounded-bl-none self-start shadow-gray-200/50 dark:shadow-black/40'">

          <div v-if="item.originalText" :dir="RTL_LANGS.includes(item.speakerLanguage) ? 'rtl' : 'ltr'" class="text-xs italic opacity-60 mb-1.5">
            {{ item.originalText }}
          </div>

          <hr v-if="!item.isSelf && item.translatedText && item.translatedText !== item.originalText" class="border-t border-gray-300 dark:border-white/10 my-1.5" />

          <div v-if="!item.isSelf && item.translatedText && item.translatedText !== item.originalText" :dir="RTL_LANGS.includes(userTargetLang) ? 'rtl' : 'ltr'" class="text-sm font-[500] text-current">
            {{ item.translatedText }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, nextTick } from 'vue';
import { LANGUAGES } from '~/composables/languages';

const props = defineProps({
  transcripts: { type: Array, required: true },
  userTargetLang: { type: String, required: true }
});

const RTL_LANGS = ['ar', 'he', 'ur', 'fa'];
const scrollContainer = ref(null);

watch(() => props.transcripts, async () => {
  await nextTick();
  if (scrollContainer.value) scrollContainer.value.scrollTop = scrollContainer.value.scrollHeight;
}, { deep: true });
</script>

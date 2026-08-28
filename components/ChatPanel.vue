<template>
  <div class="flex flex-col h-full overflow-hidden">
    <div class="flex-1 overflow-y-auto p-4 space-y-3" ref="scrollContainer">
      <div v-if="messages.length === 0" class="h-full flex items-center justify-center text-center px-6">
        <p class="text-sm font-medium text-gray-400 dark:text-gray-500">لا توجد رسائل بعد — ابدأ المحادثة</p>
      </div>
      <div v-for="(m, i) in messages" :key="i" class="flex flex-col gap-1 animate-fade-up" :class="m.isSelf ? 'items-end' : 'items-start'">
        <span class="text-[11px] font-bold text-gray-500 dark:text-gray-400">{{ m.name }}</span>
        <div class="max-w-[85%] px-3.5 py-2 rounded-2xl text-sm shadow-sm"
             :class="m.isSelf
               ? 'bg-gradient-to-br from-[#FF4D00] to-[#ff7a40] text-white rounded-br-none'
               : 'bg-gray-100 dark:bg-[#1a1a1a] text-gray-800 dark:text-gray-100 rounded-bl-none border border-gray-200 dark:border-[#2a2a2a]'">
          {{ m.text }}
        </div>
      </div>
    </div>
    <div class="p-3 border-t border-gray-200 dark:border-white/10">
      <div class="flex gap-2">
        <input
          v-model="draft"
          @keyup.enter="send"
          type="text"
          placeholder="اكتب رسالة..."
          class="flex-1 bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-2.5 text-sm text-gray-800 dark:text-white placeholder-gray-400 focus:border-[#FF4D00] focus:ring-1 focus:ring-[#FF4D00] outline-none transition"
        />
        <button @click="send" class="px-4 rounded-xl bg-[#FF4D00] hover:bg-[#e64500] text-white flex items-center justify-center transition" title="إرسال">
          <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path stroke-linecap="round" stroke-linejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" /></svg>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, nextTick } from 'vue';

const props = defineProps({
  messages: { type: Array, default: () => [] }
});
const emit = defineEmits(['send']);

const draft = ref('');
const scrollContainer = ref(null);

function send() {
  const t = draft.value.trim();
  if (!t) return;
  emit('send', { text: t });
  draft.value = '';
}
</script>

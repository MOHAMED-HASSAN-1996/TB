<template>
  <div class="flex items-center gap-3">
    <button type="button" @click="$emit('toggle-mic')" class="w-[56px] h-[56px] rounded-full grid place-items-center transition-all border shadow-sm"
      :class="listening ? 'bg-[#FF4D00] border-[#FF4D00] text-white shadow-[0_10px_20px_rgba(255,77,0,0.35)]' : 'bg-white dark:bg-zinc-900 border-zinc-200 dark:border-white/10 text-zinc-700 dark:text-zinc-300 hover:border-[#FF4D00]/40'">
      <!-- mic solid when on -->
      <svg v-if="listening" class="h-5 w-5" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a3 3 0 0 0-3 3v5a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/><path d="M19 10a7 7 0 0 1-14 0H3a9 9 0 0 0 8 8.94V22h2v-1.06A9 9 0 0 0 21 10h-2Z"/></svg>
      <svg v-else class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2a3 3 0 0 0-3 3v5a3 3 0 0 0 3 3 3 3 0 0 0 3-3V5a3 3 0 0 0-3-3Z"/><path d="M19 10a7 7 0 0 1-14 0"/><path d="M12 15v4"/><path d="M8 19h8"/><line x1="2" y1="2" x2="22" y2="22"/></svg>
    </button>
    <button type="button" @click="$emit('toggle-camera')" class="w-[56px] h-[56px] rounded-full grid place-items-center transition-all border shadow-sm"
      :class="cameraOn ? 'bg-[#FF4D00] border-[#FF4D00] text-white shadow-[0_10px_20px_rgba(255,77,0,0.35)]' : 'bg-white dark:bg-zinc-900 border-zinc-200 dark:border-white/10 text-zinc-700 dark:text-zinc-300 hover:border-[#FF4D00]/40'">
      <svg v-if="cameraOn" class="h-5 w-5" viewBox="0 0 24 24" fill="currentColor"><path d="M15 10l4.5-3A1 1 0 0 1 21 8v8a1 1 0 0 1-1.5.87L15 14v-4Z"/><rect x="3" y="6" width="12" height="12" rx="2"/></svg>
      <svg v-else class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.5 13.5 3 2"/><path d="M15 10l4.5-3A1 1 0 0 1 21 8v8a1 1 0 0 1-1.5.87L15 14"/><rect x="3" y="6" width="12" height="12" rx="2"/></svg>
    </button>
    <button type="button" @click="$emit('leave')" class="h-[48px] px-6 rounded-full bg-[#E11D48] hover:bg-[#BE123C] text-white font-black text-sm inline-flex items-center gap-2 shadow-[0_8px_20px_rgba(225,29,72,0.35)] transition">
      <svg class="h-4 w-4" viewBox="0 0 24 24" fill="currentColor"><path d="M16 8a1 1 0 0 1 1.7.7L17 9v6a1 1 0 1 1-2 0V9a1 1 0 0 1 1-1Z"/><path d="M12 2a1 1 0 0 1 1 1v1h4a3 3 0 0 1 3 3v10a3 3 0 0 1-3 3h-4v1a1 1 0 1 1-2 0v-1H7a3 3 0 0 1-3-3V7a3 3 0 0 1 3-3h4V3a1 1 0 0 1 1-1Z"/></svg>
      مغادرة
    </button>
  </div>
</template>
<script setup lang="ts">
defineProps<{ listening: boolean; cameraOn: boolean }>();
defineEmits<{ (e:'toggle-mic'):void; (e:'toggle-camera'):void; (e:'leave'):void }>();
</script>

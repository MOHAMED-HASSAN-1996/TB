<template>
  <div class="flex flex-col items-center gap-2">
    <!-- Pulsing rings when listening -->
    <div class="relative flex items-center justify-center">
      <div v-if="listening" class="absolute -inset-3 rounded-full border border-[#FF4D00]/30 animate-ping opacity-20" />
      <button
        @click="$emit('toggle')"
        class="relative w-20 h-20 rounded-full flex items-center justify-center transition-all duration-300 group"
        :class="listening
          ? 'bg-gradient-to-br from-[#FF4D00] to-[#ff7a40] shadow-[0_0_30px_rgba(255,77,0,0.45)] scale-105'
          : 'bg-white/5 border border-white/10 hover:border-[#FF4D00]/50 hover:bg-white/10'"
      >
        <svg class="h-8 w-8 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path v-if="!listening" stroke-linecap="round" stroke-linejoin="round" d="M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3z" />
          <path v-else stroke-linecap="round" stroke-linejoin="round" d="M15 10a3 3 0 11-6 0V4a3 3 0 016 0v6z" />
          <path stroke-linecap="round" stroke-linejoin="round" d="M19 10a7 7 0 01-14 0M12 17v3m0 0H8m4 0h4" />
        </svg>

        <!-- little status dot -->
        <span class="absolute top-1 right-1 h-2.5 w-2.5 rounded-full" :class="listening ? 'bg-emerald-400 animate-pulse' : 'bg-gray-500'" />
      </button>
      <div v-if="listening" class="absolute -inset-6 rounded-full border border-[#FF4D00]/10" />
    </div>

    <div class="flex flex-col items-center gap-1">
      <span class="text-xs font-bold tracking-widest uppercase" :class="listening ? 'text-[#FF4D00]' : 'text-gray-500 dark:text-gray-400'">
        {{ listening ? 'جارٍ الاستماع...' : 'اضغط للتحدث' }}
      </span>
      <span v-if="interimText" class="text-xs text-gray-400 italic max-w-[260px] text-center truncate">"{{ interimText }}"</span>
    </div>

    <p v-if="errorMsg" class="text-[11px] text-red-500 font-medium bg-red-500/10 px-3 py-1 rounded-full border border-red-500/20">
      {{ errorMsg }}
    </p>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  listening: boolean;
  interimText: string;
  errorMsg: string;
}>();
defineEmits<{ (e: 'toggle'): void }>();
</script>

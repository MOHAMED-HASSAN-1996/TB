<template>
  <div class="relative">
    <div class="absolute inset-0 bg-gradient-to-r from-[#FF4D00] to-[#ff7a40] rounded-2xl blur opacity-10 pointer-events-none" />
    <select
      :value="modelValue"
      @change="$emit('update:modelValue', ($event.target as HTMLSelectElement).value)"
      class="w-full relative bg-black/40 border border-white/10 dark:border-white/15 rounded-2xl px-4 py-3.5 text-white text-sm font-bold appearance-none focus:outline-none focus:border-[#FF4D00] focus:ring-1 focus:ring-[#FF4D00] transition-all cursor-pointer"
    >
      <option
        v-for="(lang, code) in LANGUAGES"
        :key="code"
        :value="code"
        class="bg-[#121212] text-white"
      >
        {{ lang.flag }} {{ label === 'ltr' ? lang.name : lang.nativeName }}
      </option>
    </select>
    <svg class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500 pointer-events-none" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/></svg>
  </div>
</template>

<script setup lang="ts">
import { LANGUAGES } from '~/composables/languages';

defineProps<{
  modelValue: string;
  label?: 'rtl' | 'ltr';
}>();
defineEmits<{ (e: 'update:modelValue', v: string): void }>();
</script>

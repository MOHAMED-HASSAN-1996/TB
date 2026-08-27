<template>
  <div class="rounded-3xl bg-[#0f0f0f] border border-[#1f1f1f] flex flex-col relative overflow-hidden shadow-2xl min-h-[250px]">
    <div class="absolute inset-0 bg-gradient-to-b from-blue-900/10 to-transparent pointer-events-none"></div>

    <div class="p-4 flex justify-between items-start relative z-10">
      <div class="bg-blue-600/20 text-blue-400 px-3 py-1 rounded-full text-xs font-bold ring-1 ring-blue-500/30">
        {{ label }}
      </div>
      <div v-if="speaking" class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
    </div>

    <div class="flex-1 flex items-center justify-center relative">
      <video
        ref="videoEl"
        autoplay
        playsinline
        :muted="muted"
        class="w-full h-full object-cover rounded-b-3xl"
      ></video>
      <div v-if="!hasStream" class="absolute inset-0 flex items-center justify-center">
        <div class="w-20 h-20 rounded-full bg-[#1f1f1f] border-2 border-dashed border-gray-700 flex items-center justify-center">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.55-2.28A1 1 0 0121 8.62v6.76a1 1 0 01-1.45.91L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"/></svg>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted } from 'vue';

const props = defineProps({
  stream: { type: Object as () => MediaStream | null, default: null },
  label: { type: String, default: 'Video' },
  muted: { type: Boolean, default: false },
  speaking: { type: Boolean, default: false }
});

const videoEl = ref(null);
const hasStream = ref(false);

function attach() {
  if (videoEl.value && props.stream) {
    videoEl.value.srcObject = props.stream;
    hasStream.value = props.stream.getTracks().length > 0;
  } else {
    hasStream.value = false;
  }
}

watch(() => props.stream, attach);
onMounted(attach);
onUnmounted(() => { if (videoEl.value) videoEl.value.srcObject = null; });
</script>

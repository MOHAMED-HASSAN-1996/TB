<template>
  <div class="flex flex-col items-center gap-3 w-48 mx-auto -translate-x-[50%] md:translate-x-0 ml-1/2 md:ml-0 absolute bottom-8 left-1/2 md:static md:bottom-auto md:left-auto">
    <button
      @mousedown="start"
      @mouseup="stop"
      @mouseleave="cancel"
      @touchstart.prevent="start"
      @touchend.prevent="stop"
      class="w-20 h-20 rounded-full flex items-center justify-center transition-all duration-200 outline-none select-none relative group touch-manipulation z-50"
      :class="{
        'bg-[#1a1a1a] shadow-[0_0_20px_rgba(124,58,237,0.5)] border-2 border-violet-600': state === 'idle',
        'bg-red-500 shadow-[0_0_35px_rgba(239,68,68,0.9)] scale-95 border-none': state === 'recording',
        'bg-[#141414] border border-gray-700 pointer-events-none': state === 'processing'
      }"
    >
      <div v-if="state === 'processing'" class="w-8 h-8 border-4 border-violet-500/30 border-t-violet-500 rounded-full animate-spin"></div>
      
      <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 transition-colors" :class="state === 'recording' ? 'text-white' : 'text-violet-500'" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
        <path stroke-linecap="round" stroke-linejoin="round" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
      </svg>
      
      <div v-if="state === 'recording'" class="absolute inset-0 rounded-full border-2 border-red-500 animate-ping opacity-75"></div>
      <div v-if="state === 'processing'" class="absolute inset-0 rounded-full border border-violet-500 animate-pulse opacity-50"></div>
    </button>
    
    <span class="text-xs font-bold tracking-widest uppercase transition-colors" :class="{'text-red-400': state==='recording', 'text-violet-400': state==='processing', 'text-gray-500': state==='idle'}">
      {{ statusText }}
    </span>
  </div>
</template>

<script setup>
import { ref, computed, onUnmounted } from 'vue';

const emit = defineEmits(['audio-chunk', 'error']);
const state = ref('idle'); 
const mediaRecorder = ref(null);
const audioChunks = ref([]);

const statusText = computed(() => {
  if (state.value === 'recording') return 'Release Send';
  if (state.value === 'processing') return 'Translating';
  return 'Hold Speak';
});

const start = async () => {
  if (state.value !== 'idle') return;
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    state.value = 'recording';
    audioChunks.value = [];
    
    let mimeType = 'audio/webm;codecs=opus';
    if (!MediaRecorder.isTypeSupported(mimeType)) mimeType = 'audio/webm';
    
    mediaRecorder.value = new MediaRecorder(stream, { mimeType });
    mediaRecorder.value.addEventListener('dataavailable', e => audioChunks.value.push(e.data));
    mediaRecorder.value.addEventListener('stop', () => {
      const audioBlob = new Blob(audioChunks.value, { type: mimeType });
      const reader = new FileReader();
      reader.readAsDataURL(audioBlob);
      reader.onloadend = () => {
        emit('audio-chunk', reader.result);
        state.value = 'processing';
        setTimeout(() => { if(state.value === 'processing') state.value = 'idle'; }, 6000);
      };
      stream.getTracks().forEach(t => t.stop());
    });
    mediaRecorder.value.start();
  } catch (err) {
    emit('error', 'Microphone blocked.');
    state.value = 'idle';
  }
};

const stop = () => { if (state.value === 'recording' && mediaRecorder.value) mediaRecorder.value.stop(); };
const cancel = () => stop();

onUnmounted(() => { if(mediaRecorder.value && mediaRecorder.value.state !== 'inactive') mediaRecorder.value.stream.getTracks().forEach(t=>t.stop()); });
defineExpose({ resetState: () => { state.value = 'idle'; } });
</script>

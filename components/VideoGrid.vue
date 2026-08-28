<template>
  <div class="grid gap-3 w-full" :class="gridClass">
    <div v-for="p in participants" :key="p.socketId || p.name" class="relative rounded-[24px] overflow-hidden border aspect-video flex items-center justify-center bg-white dark:bg-zinc-900"
      :class="p.isSelf ? 'border-[#FF4D00]/30 shadow-[0_8px_24px_rgba(255,77,0,0.12)]' : 'border-zinc-200 dark:border-white/10 shadow-sm'">
      <div v-if="p.talking" class="absolute inset-0 rounded-[24px] ring-2 ring-[#FF4D00] pointer-events-none" />
      <video v-if="p.isSelf && p.videoOn && selfStream" :ref="(el:any)=>setSelfVideo(el)" autoplay playsinline muted class="absolute inset-0 w-full h-full object-cover scale-x-[-1]" />
      <img v-else-if="!p.isSelf && (p as any).frame" :src="(p as any).frame" class="absolute inset-0 w-full h-full object-cover" alt="" />
      <div v-else class="flex flex-col items-center gap-3 p-6">
        <div class="relative">
          <div class="w-[72px] h-[72px] rounded-full grid place-items-center text-white font-black text-xl shadow" :class="p.isSelf ? 'bg-[#FF4D00]' : 'bg-zinc-900 dark:bg-zinc-800'">{{ (p.name||'?')[0].toUpperCase() }}</div>
          <span class="absolute -bottom-1 -right-1 w-6 h-6 rounded-full border-2 border-white dark:border-zinc-900 grid place-items-center text-[10px]" :class="p.talking ? 'bg-emerald-500' : 'bg-zinc-400'"><span class="w-2 h-2 rounded-full bg-white animate-pulse" v-if="p.talking"/></span>
        </div>
        <div class="text-xs font-bold text-zinc-500 dark:text-zinc-400">{{ p.isSelf ? 'أنت' : 'مشارك' }}</div>
      </div>
      <div class="absolute bottom-0 inset-x-0 p-3 bg-gradient-to-t from-black/70 via-black/20 to-transparent">
        <div class="flex items-center gap-2 text-white">
          <span class="text-sm font-extrabold drop-shadow">{{ p.name }}</span>
          <span v-if="p.isSelf" class="text-[10px] font-black px-1.5 py-0.5 rounded bg-[#FF4D00]">أنت</span>
        </div>
        <div class="flex items-center gap-1.5 text-[11px] text-white/85"><span>{{ LANGUAGES[p.language]?.flag || '🌐' }}</span><span class="font-bold">{{ LANGUAGES[p.language]?.nativeName || p.language }}</span></div>
      </div>
      <span v-if="p.isSelf && !p.videoOn" class="absolute top-3 end-3 w-8 h-8 rounded-full bg-black/60 border border-white/15 grid place-items-center"><svg class="h-4 w-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 3l18 18"/><path d="M10.5 10.5L15 6l4.5 3V16L15 19"/></svg></span>
    </div>
  </div>
</template>
<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { LANGUAGES } from '~/composables/languages';
const props = defineProps<{ participants: Array<{ socketId?:string; name:string; language:string; isSelf?:boolean; talking?:boolean; videoOn?:boolean; frame?: string | null }>; selfStream?: MediaStream | null; }>();
const selfVideo = ref<HTMLVideoElement|null>(null);
function setSelfVideo(el:any){ if(!el) return; selfVideo.value=el as HTMLVideoElement; if(props.selfStream){ try{ el.srcObject=props.selfStream; el.play?.().catch(()=>{});}catch(e){console.warn(e);} } }
watch(()=>props.selfStream, (s)=>{ if(selfVideo.value && s){ selfVideo.value.srcObject=s; selfVideo.value.play?.().catch(()=>{});} });
const gridClass = computed(()=>{ const n=props.participants.length; if(n<=1) return 'grid-cols-1'; if(n===2) return 'grid-cols-2'; if(n<=4) return 'grid-cols-2'; return 'grid-cols-3'; });
</script>

<template>
  <div class="h-screen bg-[#0a0a0a] flex flex-col font-sans text-white overflow-hidden">
    <!-- Header -->
    <header class="h-16 shrink-0 border-b border-[#1f1f1f] bg-[#0a0a0a]/90 backdrop-blur-lg flex items-center justify-between px-4 sm:px-6 z-20 shadow-md">
      <div class="flex items-center gap-4">
        <NuxtLink to="/" class="flex items-center gap-2.5">
          <div class="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-[0_0_10px_rgba(37,99,235,0.3)]">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z"/><path d="M12 8v8"/><path d="M8 12h8"/></svg>
          </div>
          <span class="text-base font-bold tracking-tight hidden sm:block">TalkBridge</span>
        </NuxtLink>
        <div class="h-6 w-px bg-[#1f1f1f]"></div>
        <div @click="copyCode" class="flex items-center gap-2 cursor-pointer group bg-[#141414] border border-[#1f1f1f] px-3 py-1.5 rounded-full hover:border-blue-500/50 transition">
          <span class="font-mono text-blue-400 font-bold tracking-widest text-xs sm:text-sm truncate max-w-[120px] sm:max-w-xs">{{ inviteLink || route.params.code }}</span>
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-gray-500 group-hover:text-blue-400 transition" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"/></svg>
          <span v-if="copied" class="text-xs text-green-400">Copied!</span>
        </div>
      </div>

      <div class="flex items-center gap-3">
        <div class="flex items-center gap-2 px-3 py-1.5 bg-[#141414] rounded-lg border border-[#1f1f1f]">
          <div class="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
          <span class="text-sm text-gray-300 font-medium">{{ participants.length }} online</span>
        </div>
        <button @click="endMeeting" class="bg-red-500 hover:bg-red-600 text-white px-4 py-1.5 rounded-lg shadow-lg font-bold text-sm transition-colors">Leave</button>
      </div>
    </header>

    <main class="flex-1 flex flex-col md:flex-row overflow-hidden relative">
      <!-- Main Area -->
      <section class="flex-1 flex flex-col p-4 sm:p-6 overflow-y-auto bg-[#050505]">
        <!-- Your control card -->
        <div class="rounded-3xl bg-[#0f0f0f] border border-[#1f1f1f] flex flex-col relative overflow-hidden shadow-2xl mb-6">
          <div class="absolute inset-0 bg-gradient-to-b from-blue-900/10 to-transparent pointer-events-none"></div>
          <div class="p-4 flex justify-between items-start relative z-10">
            <div class="bg-blue-600/20 text-blue-400 px-3 py-1 rounded-full text-xs font-bold ring-1 ring-blue-500/30">YOU</div>
            <div class="flex items-center gap-2 bg-[#000]/50 rounded-lg px-2 py-1 uppercase text-xs font-bold text-gray-400">
              <span>{{ userLang }}</span><span class="text-gray-600">→</span><span class="text-emerald-400">{{ targetLang }}</span>
            </div>
          </div>

          <div class="flex-1 flex flex-col items-center justify-center relative z-10 px-4">
            <div class="w-24 h-24 sm:w-32 sm:h-32 rounded-full flex items-center justify-center shadow-[0_0_40px_rgba(37,99,235,0.4)] mb-4 text-3xl sm:text-4xl font-bold transition-shadow duration-300"
                 :class="translator.listening.value ? 'bg-gradient-to-tr from-blue-600 to-indigo-600 ring-4 ring-blue-400/50 shadow-[0_0_60px_rgba(37,99,235,0.6)]' : 'bg-[#1f1f1f]'">
              {{ userName.charAt(0).toUpperCase() }}
            </div>
            <h2 class="text-xl sm:text-2xl font-bold text-white mb-1">{{ userName }}</h2>

            <!-- Source picker + listen buttons -->
            <div class="mt-4 flex flex-col items-center gap-3 w-full max-w-sm">
              <div class="flex gap-2 w-full">
                <button @click="startMic" :class="translator.listening.value && translator.source.value==='mic' ? 'bg-blue-600 text-white' : 'bg-[#1a1a1a] text-gray-300 hover:bg-[#222]'" class="flex-1 border border-[#2a2a2a] py-2.5 rounded-xl text-sm font-bold transition-colors flex items-center justify-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"/></svg>
                  {{ translator.listening.value && translator.source.value==='mic' ? 'Listening (mic)' : 'Use Mic' }}
                </button>
                <button @click="startTab" :class="translator.listening.value && translator.source.value==='tab' ? 'bg-emerald-600 text-white' : 'bg-[#1a1a1a] text-gray-300 hover:bg-[#222]'" class="flex-1 border border-[#2a2a2a] py-2.5 rounded-xl text-sm font-bold transition-colors flex items-center justify-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>
                  {{ translator.listening.value && translator.source.value==='tab' ? 'Capturing tab' : 'Tab Audio' }}
                </button>
              </div>

              <div v-if="translator.interimText.value" class="text-sm text-gray-300 italic text-center truncate w-full">"{{ translator.interimText.value }}"</div>
              <div v-if="translator.errorMsg.value" class="text-xs text-red-400 text-center bg-red-400/10 px-3 py-1 rounded-full border border-red-400/20">{{ translator.errorMsg.value }}</div>
              <p class="text-xs text-gray-500 text-center max-w-xs">Pick <b>Mic</b> to speak, or <b>Tab Audio</b> to translate any video/meeting playing in a Chrome tab. Chrome speaks the translation in your language.</p>
            </div>
          </div>
        </div>

        <!-- Remote / other listeners -->
        <div class="grid gap-6 auto-rows-fr" :class="gridClass">
          <div v-for="p in otherParticipants" :key="p.socketId" class="rounded-3xl bg-[#0f0f0f] border border-[#1f1f1f] flex flex-col relative overflow-hidden shadow-2xl min-h-[200px]">
            <div class="absolute inset-0 bg-gradient-to-b from-emerald-900/10 to-transparent pointer-events-none"></div>
            <div class="p-4 flex justify-between items-start relative z-10">
              <div class="bg-emerald-600/20 text-emerald-400 px-3 py-1 rounded-full text-xs font-bold ring-1 ring-emerald-500/30">LISTENER</div>
              <div class="flex items-center gap-2 bg-[#000]/50 rounded-lg px-2 py-1 uppercase text-xs font-bold text-gray-400">
                <span>{{ p.language }}</span><span class="text-gray-600">→</span><span class="text-emerald-400">{{ p.targetLanguage }}</span>
              </div>
            </div>
            <div class="flex-1 flex flex-col items-center justify-center relative z-10">
              <div class="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gradient-to-tr from-emerald-600 to-teal-600 flex items-center justify-center shadow-[0_0_40px_rgba(16,185,129,0.3)] mb-4 text-2xl sm:text-3xl font-bold">{{ p.name.charAt(0).toUpperCase() }}</div>
              <h2 class="text-lg sm:text-xl font-bold text-white mb-1 text-center px-4">{{ p.name }}</h2>
              <p class="text-emerald-400 text-xs font-bold h-5" v-if="activeSpeaker === p.socketId">Speaking…</p>
            </div>
          </div>
        </div>
      </section>

      <!-- Transcript -->
      <aside class="w-full h-1/2 md:h-auto md:w-[400px] xl:w-[450px] shrink-0 border-t md:border-t-0 md:border-l border-[#1f1f1f] bg-[#141414]/50 flex flex-col shadow-2xl z-10">
        <div class="h-14 border-b border-[#1f1f1f] flex items-center px-4 shrink-0 bg-[#0a0a0a]">
          <h2 class="text-sm font-semibold text-gray-300 uppercase tracking-widest flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"/></svg>
            Live Transcript
          </h2>
        </div>
        <div class="flex-1 overflow-y-auto p-5 space-y-5" ref="scrollContainer">
          <div v-if="transcripts.length === 0" class="h-full flex items-center justify-center text-gray-600 italic text-sm font-medium text-center">Speak or play audio — you'll see the original + translation here.</div>
          <div v-for="(item, index) in transcripts" :key="index" class="flex flex-col gap-1.5">
            <span class="text-[11px] font-bold tracking-widest uppercase flex items-center gap-1.5" :class="item.isSelf ? 'text-blue-500' : 'text-gray-500'">
              <span>{{ LANGUAGES[item.speakerLanguage]?.flag || '🌐' }}</span><span>{{ item.speakerName }}</span>
            </span>
            <div class="max-w-[90%] rounded-2xl px-4 py-3 shadow-md border"
                 :class="item.isSelf ? 'bg-blue-600/20 border-blue-500/40 text-white self-end rounded-br-none' : 'bg-[#1a1a1a] border-[#2a2a2a] text-gray-200 rounded-bl-none'">
              <div v-if="item.originalText" :dir="isRtl(item.speakerLanguage) ? 'rtl' : 'ltr'" class="text-sm opacity-80 mb-1.5 italic">{{ item.originalText }}</div>
              <hr class="border-[#2a2a2a] my-1.5" v-if="item.translatedText && item.translatedText !== item.originalText" />
              <div v-if="item.translatedText && item.translatedText !== item.originalText" :dir="isRtl(userTargetLang) ? 'rtl' : 'ltr'" class="text-sm font-semibold text-white">{{ item.translatedText }}</div>
            </div>
          </div>
        </div>
      </aside>
    </main>

    <div ref="audioContainer" class="hidden"></div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useSocket } from '~/composables/useSocket';
import { useVoiceTranslator } from '~/composables/useVoiceTranslator';
import { LANGUAGES, isRtl, DEFAULT_LANG } from '~/composables/languages';

const route = useRoute();
const router = useRouter();
const { socket, connect, disconnect } = useSocket();

const userName = String(route.query.name || '');
const userLang = String(route.query.lang || 'en');
const targetLang = String(route.query.targetLang || userLang);
const userTargetLang = targetLang;
const roomProvider = String(route.query.provider || 'auto');

// Saved target language: each user hears their OWN language from the first visit.
const SAVED_KEY = 'talkbridge-target-lang';
const savedTarget = (() => { try { return localStorage.getItem(SAVED_KEY) || ''; } catch (e) { return ''; } })();
if (savedTarget && savedTarget !== targetLang) {
  // Respect the language the user previously chose to hear.
  router.replace({ query: { ...route.query, targetLang: savedTarget } });
}

if (!userName || !userLang) router.replace('/');

const participants = ref<any[]>([]);
const mySocketId = ref('');
const transcripts = ref<any[]>([]);
const activeSpeaker = ref<string | null>(null);
const inviteLink = ref('');
const copied = ref(false);
const scrollContainer = ref<HTMLElement | null>(null);

let autoSpeak = true;

const otherParticipants = computed(() => participants.value.filter(p => p.socketId !== mySocketId.value));

const gridClass = computed(() => {
  const n = otherParticipants.value.length;
  if (n <= 1) return 'grid-cols-1';
  if (n === 2) return 'grid-cols-1 sm:grid-cols-2';
  if (n === 3) return 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3';
  return 'grid-cols-2 lg:grid-cols-3 xl:grid-cols-4';
});

// Core translator (no WebRTC): local mic/tab capture → STT → translate → speak.
const translator = useVoiceTranslator({
  myLang: userLang,
  myTargetLang: targetLang,
  onFinalText: async (text, fromLang) => {
    // 1) Show my own recognition locally.
    transcripts.value.push({ speakerName: 'You', speakerLanguage: fromLang, originalText: text, translatedText: '', isSelf: true });
    // 2) Relay the ORIGINAL text to other listeners (they translate + speak in their own lang).
    socket.value?.emit('text-chunk', { text });
    // 3) If my target differs from my source, also speak my own translation back to me.
    if (fromLang !== targetLang && autoSpeak) {
      const t = await translator.translate(text, fromLang, targetLang);
      if (t) { await translator.speak(t, targetLang); }
    }
  }
});

const startMic = () => translator.startMic();
const startTab = () => translator.startTabAudio();

const copyCode = async () => {
  const link = inviteLink.value || `${window.location.origin}/join/${route.params.code}`;
  try { await navigator.clipboard.writeText(link); copied.value = true; setTimeout(() => copied.value = false, 1500); } catch (e) {}
};

const endMeeting = () => { translator.stop(); disconnect(); router.replace('/'); };

const setupSocketListeners = () => {
  if (!socket.value) return;
  mySocketId.value = socket.value.id || '';
  socket.value.on('room-state', (data: any) => {
    participants.value = data.participants || [];
    if (!mySocketId.value) mySocketId.value = socket.value.id || '';
  });
  socket.value.on('participant-left', (data: any) => {
    participants.value = participants.value.filter(p => p.socketId !== data.socketId);
  });
  socket.value.on('participant-joined', (data: any) => {
    const existing = participants.value.find(p => p.socketId === data.participant.socketId);
    if (!existing) participants.value.push(data.participant);
  });

  // When another listener sends their recognized text, translate into MY language
  // and speak it back to me (voice-to-voice, in my language only).
  socket.value.on('transcript-update', async (data: any) => {
    if (!data || !data.originalText) return;
    const isSelf = data.speakerName === userName;
    const speakerP = participants.value.find(p => p.name === data.speakerName);
    const fromLang = speakerP ? speakerP.language : userLang;

    let translated = '';
    if (fromLang !== targetLang) {
      translated = await translator.translate(data.originalText, fromLang, targetLang);
    }
    if (!translated) translated = data.originalText;

    if (speakerP) activeSpeaker.value = speakerP.socketId;
    if (autoSpeak && !isSelf && fromLang !== targetLang) {
      await translator.speak(translated, targetLang);
    }
    setTimeout(() => { activeSpeaker.value = null; }, 4000);

    transcripts.value.push({
      speakerName: isSelf ? 'You' : data.speakerName,
      speakerLanguage: fromLang,
      originalText: data.originalText,
      translatedText: (fromLang !== targetLang ? translated : ''),
      isSelf
    });
  });
};

watchScroll();
function watchScroll() {
  watch(() => transcripts.value.length, async () => {
    await nextTick();
    if (scrollContainer.value) scrollContainer.value.scrollTop = scrollContainer.value.scrollHeight;
  });
}

onMounted(() => {
  if (!userName || !userLang) { router.replace('/'); return; }
  inviteLink.value = `${window.location.origin}/join/${route.params.code}`;
  connect(route.params.code, userName, userLang, targetLang, roomProvider);
  setupSocketListeners();
});

onUnmounted(() => { translator.stop(); disconnect(); });
</script>

<template>
  <div class="h-screen bg-[#0a0a0a] flex flex-col font-sans text-white overflow-hidden">
    <!-- Header -->
    <header class="h-16 shrink-0 border-b border-[#1f1f1f] bg-[#0a0a0a]/90 backdrop-blur-lg flex items-center justify-between px-6 z-20 shadow-md">
      <div class="flex items-center gap-6">
        <NuxtLink to="/" class="flex items-center gap-3">
          <div class="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-[0_0_10px_rgba(37,99,235,0.3)]">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z"></path><path d="M12 8v8"></path><path d="M8 12h8"></path>
            </svg>
          </div>
          <span class="text-lg font-bold tracking-tight hidden sm:block">TalkBridge Meet</span>
        </NuxtLink>
        
        <div class="h-6 w-px bg-[#1f1f1f]"></div>

        <div @click="copyCode" class="flex items-center gap-2 cursor-pointer group bg-[#141414] border border-[#1f1f1f] px-4 py-1.5 rounded-full hover:border-blue-500/50 transition">
          <span class="font-mono text-blue-400 font-bold tracking-widest text-xs sm:text-sm relative top-px truncate max-w-[150px] sm:max-w-xs">{{ inviteLink || route.params.code }}</span>
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-gray-500 group-hover:text-blue-400 transition" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
          <span v-if="copied" class="ml-2 text-xs text-green-400">Copied!</span>
        </div>
      </div>
      
      <div class="flex items-center gap-4">
        <div class="flex items-center gap-2 px-3 py-1.5 bg-[#141414] rounded-lg border border-[#1f1f1f]">
          <div class="w-2 h-2 rounded-full bg-green-500 animate-pulse outline outline-2 outline-green-500/20"></div>
          <span class="text-sm text-gray-300 font-medium">{{ humanParticipants.length }} in Meeting</span>
        </div>

        <!-- Camera / Mic controls (free WebRTC) -->
        <button @click="toggleCamera"
                :class="camOn ? 'bg-[#1f1f1f] text-gray-200 hover:bg-gray-800' : 'bg-red-500/20 text-red-400'"
                class="px-3 py-1.5 rounded-lg border border-[#1f1f1f] text-sm font-bold flex items-center gap-2 transition-colors"
                :title="camOn ? 'Turn camera off' : 'Turn camera on'">
          <svg v-if="camOn" xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.55-2.28A1 1 0 0121 8.62v6.76a1 1 0 01-1.45.91L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"/></svg>
          <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.55-2.28A1 1 0 0121 8.62v6.76a1 1 0 01-1.45.91L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"/><line x1="3" y1="3" x2="21" y2="21" stroke="currentColor" stroke-width="2"/></svg>
        </button>
        <button @click="toggleMic"
                :class="micOn ? 'bg-[#1f1f1f] text-gray-200 hover:bg-gray-800' : 'bg-red-500/20 text-red-400'"
                class="px-3 py-1.5 rounded-lg border border-[#1f1f1f] text-sm font-bold flex items-center gap-2 transition-colors"
                :title="micOn ? 'Mute mic' : 'Unmute mic'">
          <svg v-if="micOn" xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"/></svg>
          <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"/><line x1="3" y1="3" x2="21" y2="21" stroke="currentColor" stroke-width="2"/></svg>
        </button>
          
        <button @click="endMeeting" class="bg-red-500 hover:bg-red-600 text-white px-5 py-1.5 rounded-lg shadow-lg font-bold text-sm flex items-center gap-2 transition-colors">
          <span>End Meeting</span>
        </button>
      </div>
    </header>

    <main class="flex-1 flex flex-col md:flex-row overflow-hidden relative">
      <!-- Main Area (Dynamic Zoom/Google Meet Grid) -->
      <section class="flex-1 flex flex-col p-6 overflow-y-auto bg-[#050505]">
        <div class="grid gap-6 auto-rows-fr h-full" :class="gridClass">

          <!-- Local video tile (your camera) -->
          <VideoTile
            v-if="localStream"
            :stream="localStream"
            :label="`${userName} (You)`"
            :muted="true"
            :speaking="isAudioPlaying"
          />

          <!-- Remote video tiles (WebRTC peers) -->
          <VideoTile
            v-for="(stream, peerId) in remoteStreams"
            :key="peerId"
            :stream="stream"
            :label="remoteName(peerId)"
            :muted="false"
            :speaking="activeSpeakerPeer === peerId"
          />

          <!-- Host Box (audio translation placeholder when no camera) -->
          <div class="rounded-3xl bg-[#0f0f0f] border border-[#1f1f1f] flex flex-col relative overflow-hidden shadow-2xl min-h-[250px]">
            <div class="absolute inset-0 bg-gradient-to-b from-blue-900/10 to-transparent pointer-events-none"></div>
            <div class="p-4 flex justify-between items-start relative z-10">
              <div class="bg-blue-600/20 text-blue-400 px-3 py-1 rounded-full text-xs font-bold ring-1 ring-blue-500/30">YOU</div>
              <div class="flex items-center gap-2 bg-[#000]/50 rounded-lg px-2 py-1 uppercase text-xs font-bold text-gray-400">
                <span>{{ userLang }}</span>
              </div>
            </div>
            
            <div class="flex-1 flex flex-col items-center justify-center relative z-10">
              <div class="w-24 h-24 sm:w-32 sm:h-32 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-full flex items-center justify-center shadow-[0_0_40px_rgba(37,99,235,0.4)] mb-4 text-3xl sm:text-4xl font-bold">
                 {{ userName.charAt(0).toUpperCase() }}
              </div>
              <h2 class="text-xl sm:text-2xl font-bold text-white mb-1">{{ userName }}</h2>
              <p class="text-gray-400 text-sm mb-6">Host</p>

              <!-- Embedded ActiveListener -->
              <div class="mt-auto mb-6 w-full flex justify-center scale-100 sm:scale-110">
                <ActiveListener :language="userLang" :is-muted="isAudioPlaying" @text-chunk="handleTextChunk" />
              </div>
            </div>
          </div>

          <!-- Waiting for Client Placeholder (if alone) -->
          <div v-if="clientParticipants.length === 0" class="rounded-3xl bg-[#0f0f0f] border border-[#1f1f1f] flex flex-col items-center justify-center relative overflow-hidden shadow-2xl min-h-[250px] p-8 text-center">
             <div class="absolute inset-0 bg-gradient-to-b from-gray-900/10 to-transparent pointer-events-none"></div>
             <div class="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-[#1f1f1f] border-2 border-dashed border-gray-700 flex items-center justify-center mb-6 animate-pulse">
               <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/></svg>
             </div>
             <h3 class="text-xl font-bold text-gray-300 mb-2">Waiting for Others</h3>
             <p class="text-gray-500 text-sm max-w-xs">Share the invite link located at the top to invite someone to this meeting.</p>
          </div>

          <!-- Dynamic Client Grid -->
          <template v-else>
              <div v-for="client in clientParticipants" :key="client.socketId" class="rounded-3xl bg-[#0f0f0f] border border-[#1f1f1f] flex flex-col relative overflow-hidden shadow-2xl min-h-[250px]">
                <div class="absolute inset-0 bg-gradient-to-b from-emerald-900/10 to-transparent pointer-events-none"></div>
                
                <div class="p-4 flex justify-between items-start relative z-10">
                    <div class="bg-emerald-600/20 text-emerald-400 px-3 py-1 rounded-full text-xs font-bold ring-1 ring-emerald-500/30 line-clamp-1">
                        {{ client.name === 'Virtual Buddy' ? 'AI Bot' : 'CLIENT' }}
                    </div>
                    <div class="flex items-center gap-2 bg-[#000]/50 rounded-lg px-2 py-1 uppercase text-xs font-bold text-gray-400">
                        <span>{{ client.language }}</span>
                    </div>
                </div>
                
                <div class="flex-1 flex flex-col items-center justify-center relative">
                    <div class="absolute inset-0 flex items-center justify-center opacity-20 pointer-events-none" v-if="activeSpeaker === client.socketId">
                       <div class="w-48 h-48 sm:w-64 sm:h-64 bg-emerald-500 rounded-full blur-[80px] sm:blur-[100px] animate-pulse"></div>
                    </div>
                    <div class="w-24 h-24 sm:w-32 sm:h-32 bg-gradient-to-tr from-emerald-600 to-teal-600 rounded-full flex items-center justify-center shadow-[0_0_40px_rgba(16,185,129,0.3)] mb-4 text-3xl sm:text-4xl font-bold relative z-10 transition-shadow duration-300"
                         :class="{'ring-4 ring-emerald-400 shadow-[0_0_60px_rgba(16,185,129,0.6)]': activeSpeaker === client.socketId}">
                       {{ client.name.charAt(0).toUpperCase() }}
                    </div>
                    <h2 class="text-xl sm:text-2xl font-bold text-white mb-2 relative z-10 text-center px-4">{{ client.name }}</h2>
                    <p class="text-emerald-400 text-sm mb-4 font-bold relative z-10 h-5" v-if="activeSpeaker === client.socketId">Speaking...</p>
                    <p class="h-5 mb-4" v-else></p>
                </div>
              </div>
          </template>
        </div>
      </section>

      <!-- Right side: Transcript Panel -->
      <aside class="w-full h-1/2 md:h-auto md:w-[400px] xl:w-[450px] shrink-0 border-t md:border-t-0 md:border-l border-[#1f1f1f] bg-[#141414]/50 flex flex-col shadow-2xl z-10">
        <div class="h-14 border-b border-[#1f1f1f] flex items-center px-4 shrink-0 bg-[#0a0a0a]">
          <h2 class="text-sm font-semibold text-gray-300 uppercase tracking-widest flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
            </svg>
            Live Transcript
          </h2>
        </div>

        <div class="px-4 py-2 border-b border-[#1f1f1f] bg-[#0a0a0a]/50">
          <div v-if="otherUserTyping" class="text-sm text-gray-200">
            <p class="truncate">{{ otherUserTyping }}</p>
            <p v-if="otherUserTypingTranslated" class="text-xs text-gray-400 mt-1">{{ otherUserTypingTranslated }}</p>
          </div>
          <div v-else class="text-xs text-gray-500">No one typing</div>
        </div>

        <TranscriptPanel :transcripts="transcripts" :userTargetLang="targetLang" class="flex-1 h-full border-0 bg-transparent rounded-none" />
      </aside>
    </main>

    <!-- Invisible Audio container -->
    <div ref="audioContainer" class="hidden"></div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useWebRTC } from '~/composables/useWebRTC';

const route = useRoute();
const router = useRouter();
const { socket, connect, disconnect } = useSocket();

const participants = ref([]);
const mySocketId = ref(''); // Socket ID الخاص بالمستخدم الحالي
const transcripts = ref([]);
const activeSpeaker = ref(null);
const activeSpeakerPeer = ref(null);
const isAudioPlaying = ref(false);
let playingAudioCount = 0;
const otherUserTyping = ref('');
const otherUserTypingTranslated = ref('');
let typingTimeout = null;

// ===== WebRTC free video call state =====
const localStream = ref(null);
const camOn = ref(true);
const micOn = ref(true);
const webrtc = useWebRTC({
  socket,
  roomCode: String(route.params.code || ''),
  getLocalStream: () => localStream.value
});
const remoteStreams = webrtc.remoteStreams;

const inviteLink = ref('');
const copied = ref(false);

const userName = String(route.query.name || '');
const userLang = String(route.query.lang || 'en');
const targetLang = String(route.query.targetLang || userLang);
const roomProvider = String(route.query.provider || 'auto');

if (!userName || !userLang) {
  router.replace('/');
}

// المشاركون البشريون فقط (بدون البوت) - لعداد الحضور
const humanParticipants = computed(() => {
  return participants.value.filter(p => !p.socketId.startsWith('bot-'));
});

// جميع المشاركين الآخرين في الشبكة (بما فيهم البوت) - لعرض الـ grid
const clientParticipants = computed(() => {
  return participants.value.filter(p => p.socketId !== mySocketId.value);
});

// Zoom / Google Meet dynamic grid layout calculating 
const gridClass = computed(() => {
    // If waiting for client, length is 0, so it displays Host + Placeholder (2 grids)
    const count = clientParticipants.value.length === 0 ? 2 : 1 + clientParticipants.value.length;
    
    if (count === 1) return 'grid-cols-1';
    if (count === 2) return 'grid-cols-1 sm:grid-cols-2';
    if (count === 3) return 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3';
    if (count === 4) return 'grid-cols-2';
    return 'grid-cols-2 lg:grid-cols-3 xl:grid-cols-4';
});

const playEntrySound = () => {
    try {
        const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioCtx.destination);
        
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(800, audioCtx.currentTime);     
        oscillator.frequency.exponentialRampToValueAtTime(1200, audioCtx.currentTime + 0.1);
        
        gainNode.gain.setValueAtTime(0, audioCtx.currentTime);
        gainNode.gain.linearRampToValueAtTime(0.3, audioCtx.currentTime + 0.05);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.3);
        
        oscillator.start(audioCtx.currentTime);
        oscillator.stop(audioCtx.currentTime + 0.3);
    } catch (e) {
        console.error("Could not play entry sound", e);
    }
};

const createAudioElement = (base64Audio) => {
  isAudioPlaying.value = true;
  playingAudioCount++;
  
  const audioObj = new Audio(`data:audio/mp3;base64,${base64Audio}`);
  audioObj.play().catch(e => {
    console.error("Audio playback error:", e);
    playingAudioCount--;
    if (playingAudioCount <= 0) isAudioPlaying.value = false;
  });
  return audioObj;
};

const setupSocketListeners = () => {
  if (!socket.value) return;

  // Socket id is generated client-side in the SSE composable.
  mySocketId.value = socket.value.id || '';
  socket.value.on('room-state', (data) => {
    participants.value = data.participants || [];
    if (!mySocketId.value) mySocketId.value = socket.value.id || '';
    console.debug('[Room] room-state updated, participants:', participants.value.length);
  });

  socket.value.on('participant-left', (data) => {
    participants.value = participants.value.filter(p => p.socketId !== data.socketId);
  });

  socket.value.on('participant-joined', (data) => {
    if (data.participant.name !== userName && data.participant.name !== 'Virtual Buddy') {
      playEntrySound();
    }
    const existing = participants.value.find(p => p.socketId === data.participant.socketId);
    if (!existing) participants.value.push(data.participant);
  });

  socket.value.on('transcript-update', (data) => {
    if (!data || !data.originalText) return;
    const isSelf = data.speakerName === userName;
    const speakerP = participants.value.find(p => p.name === data.speakerName);
    transcripts.value.push({
      speakerName: isSelf ? 'You' : data.speakerName,
      speakerLanguage: speakerP ? speakerP.language : userLang,
      originalText: data.originalText,
      translatedText: '',
      isSelf
    });
  });

  socket.value.on('translated-audio', (data) => {
    const speakerP = participants.value.find(p => p.name === data.speakerName);
    if (speakerP) {
      activeSpeaker.value = speakerP.socketId;
      activeSpeakerPeer.value = speakerP.socketId;
    }
    if (data.audioBase64) {
      const a = createAudioElement(data.audioBase64);
      a.onended = () => {
        activeSpeaker.value = null;
        activeSpeakerPeer.value = null;
        playingAudioCount--;
        if (playingAudioCount <= 0) isAudioPlaying.value = false;
      };
    } else {
      setTimeout(() => { activeSpeaker.value = null; activeSpeakerPeer.value = null; }, 2000);
    }
    let updated = false;
    for (let i = transcripts.value.length - 1; i >= 0; i--) {
      const t = transcripts.value[i];
      if (t.speakerName === data.speakerName && t.originalText === data.originalText && !t.translatedText) {
        transcripts.value[i] = { ...t, translatedText: data.translatedText };
        updated = true;
        break;
      }
    }
    if (!updated) {
      transcripts.value.push({
        speakerName: data.speakerName,
        speakerLanguage: speakerP ? speakerP.language : 'en',
        originalText: data.originalText,
        translatedText: data.translatedText,
        isSelf: false
      });
    }
  });

  socket.value.on('rtc-signal', (data) => {
    if (data.room?.toUpperCase() === String(route.params.code).toUpperCase()) {
      webrtc.handleRemoteSignal(data.from, data.signal);
    }
  });

  socket.value.on('rtc-peer-left', (data) => {
    webrtc.handlePeerLeft(data.socketId);
  });
};

onMounted(async () => {
  inviteLink.value = `${window.location.origin}/join/${route.params.code}`;

  // Start local camera+mic for the free WebRTC call (best-effort; call still works without it).
  try {
    localStream.value = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
  } catch (e) {
    console.warn('[Room] camera/mic unavailable, continuing without video:', e);
    camOn.value = false;
  }

  // IMPORTANT: connect() must run FIRST so that socket.value is created (io() is sync)
  // then setupSocketListeners() can attach events on the non-null socket object.
  connect(route.params.code, userName, userLang, targetLang, roomProvider);
  setupSocketListeners();
  webrtc.bind();
});

onUnmounted(() => {
  disconnect();
  if (localStream.value) localStream.value.getTracks().forEach(t => t.stop());
});

const remoteName = (peerId) => {
  const p = participants.value.find((x) => x.socketId === peerId);
  return p ? p.name : 'Guest';
};

const toggleCamera = () => {
  const track = localStream.value?.getVideoTracks()[0];
  if (!track) return;
  track.enabled = !track.enabled;
  camOn.value = track.enabled;
};

const toggleMic = () => {
  const track = localStream.value?.getAudioTracks()[0];
  if (!track) return;
  track.enabled = !track.enabled;
  micOn.value = track.enabled;
};

const handleTextChunk = (text) => {
  if (socket.value && text) {
    socket.value.emit('text-chunk', { text });
  }
};

const copyCode = () => { 
    navigator.clipboard.writeText(inviteLink.value); 
    copied.value = true; 
    setTimeout(() => copied.value = false, 2000); 
};

const endMeeting = () => {
    sessionStorage.setItem('talkbridge_summary', JSON.stringify(transcripts.value));
    router.push('/summary');
};
</script>

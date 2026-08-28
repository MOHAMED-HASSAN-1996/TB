<template>
  <div dir="rtl" lang="ar" class="min-h-screen w-full flex flex-col bg-[#F7F7F5] dark:bg-[#080808] text-zinc-900 dark:text-white">
    <!-- SETUP -->
    <div v-if="!started" class="flex-1 flex items-center justify-center p-4 sm:p-6 relative overflow-hidden">
      <div class="pointer-events-none absolute inset-0">
        <div class="absolute -top-24 left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-[#FF4D00]/10 rounded-full blur-[80px]" />
      </div>
      <div class="w-full max-w-[520px] relative">
        <div class="flex items-center justify-center gap-2.5 mb-6">
          <div class="w-10 h-10 rounded-[14px] bg-[#FF4D00] grid place-items-center shadow-[0_8px_20px_rgba(255,77,0,0.3)]"><svg class="h-5 w-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2a7 7 0 0 0-7 7v2a7 7 0 0 0 14 0V9a7 7 0 0 0-7-7Z"/><path d="M12 16v4"/><path d="M8 20h8"/></svg></div>
          <span class="text-xl font-black tracking-[-0.03em]">TalkBridge</span>
        </div>
        <div class="rounded-[28px] bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 shadow-[0_16px_40px_rgba(0,0,0,0.08)] p-6 sm:p-7">
          <div class="flex items-center gap-2 mb-1">
            <span class="px-2.5 py-1 rounded-full bg-[#FF4D00]/10 border border-[#FF4D00]/15 text-[#FF4D00] text-[11px] font-black tracking-widest">غرفة جديدة</span>
            <span class="text-xs font-bold text-zinc-400">جاهزة في ثوانٍ</span>
          </div>
          <h2 class="text-[22px] font-black tracking-[-0.03em]">استعد للانضمام</h2>
          <p class="text-sm text-zinc-500 dark:text-zinc-400 mt-1">اختر اسمك ولغتك — سنطلب إذن الكاميرا والميكروفون بعد البدء.</p>

          <div class="mt-6 space-y-4">
            <div>
              <label class="text-xs font-black text-zinc-700 dark:text-zinc-300">اسمك</label>
              <input v-model="name" placeholder="مثال: أحمد" class="mt-1.5 w-full h-12 rounded-[14px] border border-zinc-200 dark:border-white/10 bg-zinc-50 dark:bg-white/5 px-4 text-[14px] font-medium focus:border-[#FF4D00] focus:ring-2 focus:ring-[#FF4D00]/20 outline-none" />
            </div>
            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="text-xs font-black text-zinc-700 dark:text-zinc-300">أتحدث</label>
                <div class="mt-1.5"><LanguageSelector v-model="myLang" label="rtl" /></div>
              </div>
              <div>
                <label class="text-xs font-black text-zinc-700 dark:text-zinc-300">أسمع بـ</label>
                <div class="mt-1.5"><LanguageSelector v-model="targetLang" label="rtl" /></div>
              </div>
            </div>
            <div class="rounded-[16px] border border-dashed border-zinc-300 dark:border-white/15 bg-zinc-50 dark:bg-white/[0.02] p-3 text-center">
              <div class="text-[11px] font-black tracking-widest text-zinc-400">رمز الغرفة</div>
              <div class="text-[20px] font-black tracking-[0.32em] text-[#FF4D00] select-all">{{ roomCode }}</div>
            </div>
            <button @click="startCallPreset" :disabled="!name.trim() || connecting" class="w-full h-[52px] rounded-[16px] bg-[#FF4D00] hover:bg-[#E64500] disabled:opacity-50 text-white font-black shadow-[0_10px_24px_rgba(255,77,0,0.3)] transition">
              {{ connecting ? 'جارٍ الاتصال...' : 'بدء المكالمة — طلب إذن الكاميرا' }}
            </button>
            <p v-if="errorMsg" class="text-sm text-red-600 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-[12px] p-2 text-center">{{ errorMsg }}</p>
            <p v-if="mediaError" class="text-xs text-amber-700 bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 rounded-[12px] p-2 text-center">{{ mediaError }}</p>
          </div>
        </div>
        <button @click="leaveToHome" class="mx-auto mt-4 flex items-center gap-1.5 text-sm font-bold text-zinc-500 hover:text-[#FF4D00] transition"><svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 12H5"/><path d="M12 19l-7-7 7-7"/></svg> العودة</button>
      </div>
    </div>

    <!-- ACTIVE -->
    <div v-else class="min-h-screen w-full flex flex-col">
      <header class="h-[64px] shrink-0 px-4 sm:px-6 flex items-center justify-between border-b border-zinc-200 dark:border-white/10 bg-white/80 dark:bg-zinc-900/80 backdrop-blur sticky top-0 z-20">
        <div class="flex items-center gap-3">
          <div class="w-9 h-9 rounded-[12px] bg-[#FF4D00] grid place-items-center"><svg class="h-5 w-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2a7 7 0 0 0-7 7v2a7 7 0 0 0 14 0V9a7 7 0 0 0-7-7Z"/><path d="M12 16v4"/><path d="M8 20h8"/></svg></div>
          <div>
            <div class="text-sm font-black leading-none">TalkBridge</div>
            <div class="flex items-center gap-1.5 text-[11px] font-bold text-zinc-500"><span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"/> مباشر • {{ participants.length }} مشارك</div>
          </div>
        </div>
        <div class="flex items-center gap-2">
          <div class="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-zinc-50 dark:bg-white/5 border border-zinc-200 dark:border-white/10 text-xs font-extrabold">
            <span>{{ LANGUAGES[myLang]?.flag }} {{ LANGUAGES[myLang]?.nativeName }}</span>
            <svg class="h-3.5 w-3.5 text-[#FF4D00]" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M7 16V4m0 0L3 8m4-4l4 4m6 4v12m0 0l4-4m-4 4l-4-4"/></svg>
            <span>{{ LANGUAGES[targetLang]?.flag }} {{ LANGUAGES[targetLang]?.nativeName }}</span>
          </div>
          <button @click="openInvite" class="h-9 px-4 rounded-full bg-[#FF4D00] hover:bg-[#E64500] text-white text-xs font-black inline-flex items-center gap-1.5">
            <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.5 1.5"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.5-1.5"/></svg>
            دعوة
          </button>
          <button @click="theme.toggle()" class="w-9 h-9 rounded-full grid place-items-center bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/10">
            <svg v-if="theme.isDark.value" class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M1 12h2M21 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4"/></svg>
            <svg v-else class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
          </button>
        </div>
      </header>

      <div class="flex-1 flex flex-col lg:flex-row gap-4 p-4 sm:p-6 max-w-[1400px] w-full mx-auto">
        <div class="flex-1 flex flex-col gap-4 min-w-0">
          <div v-if="participants.length <= 1" class="mx-auto text-sm font-bold text-zinc-500 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 rounded-full px-4 py-2 shadow-sm">
            بانتظار انضمام الطرف الآخر — شارك رابط الدعوة
          </div>
          <div class="flex-1 flex items-center justify-center">
            <VideoGrid :participants="gridParticipants" :self-stream="selfStream" class="w-full" :class="gridParticipants.length===1 ? 'max-w-[720px] mx-auto' : ''" />
          </div>
          <div v-if="translator.interimText.value" class="text-center text-sm text-zinc-600 dark:text-zinc-300 italic px-4 py-1.5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 rounded-full mx-auto max-w-[80%] truncate">
            "{{ translator.interimText.value }}"
          </div>
          <div v-if="translator.errorMsg.value" class="text-center text-xs font-bold text-red-600 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-full px-4 py-1.5 mx-auto flex items-center gap-2">
            <span>{{ translator.errorMsg.value }}</span>
            <button @click="translator.startMic(); micOn=true" class="underline">إعادة المحاولة</button>
          </div>
          <div class="flex items-center gap-2 justify-center">
            <input v-model="manualTranscript" @keyup.enter="sendManualTranscript" placeholder="اكتب نصاً للتجربة بدون ميكروفون" class="h-9 rounded-full border border-zinc-200 dark:border-white/10 bg-white dark:bg-zinc-900 px-4 text-sm w-[280px] sm:w-[360px] focus:border-[#FF4D00] outline-none" />
            <button @click="sendManualTranscript" class="h-9 px-4 rounded-full bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 text-xs font-black">إرسال كنص</button>
          </div>
          <div class="flex items-center justify-center">
            <div class="rounded-full px-3 py-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 shadow-[0_8px_24px_rgba(0,0,0,0.08)] flex items-center gap-2">
              <span v-if="mediaError" class="hidden sm:inline text-xs font-bold text-amber-600 px-2">{{ mediaError }}</span>
              <MeetingControls :listening="micOn" :camera-on="cameraOn" @toggle-mic="toggleMic" @toggle-camera="toggleCamera" @leave="confirmLeave" />
            </div>
          </div>
        </div>

        <aside class="w-full lg:w-[380px] xl:w-[420px] shrink-0 flex flex-col rounded-[24px] overflow-hidden border border-zinc-200 dark:border-white/10 bg-white dark:bg-zinc-900 shadow-[0_8px_24px_rgba(0,0,0,0.06)] h-auto lg:h-[calc(100vh-88px)]">
          <div class="flex p-1.5 gap-1 border-b border-zinc-200 dark:border-white/10 bg-zinc-50 dark:bg-white/[0.02]">
            <button v-for="tab in tabs" :key="tab.key" @click="activeTab = tab.key" class="flex-1 h-9 rounded-[12px] inline-flex items-center justify-center gap-1.5 text-xs font-black transition" :class="activeTab===tab.key ? 'bg-[#FF4D00] text-white shadow' : 'text-zinc-500 hover:bg-white dark:hover:bg-white/5'">
              <svg v-if="tab.key==='transcript'" class="h-4 w-4" viewBox="0 0 24 24" fill="currentColor"><path d="M6 2a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h8l4 4v-4h2a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H6Z"/></svg>
              <svg v-else-if="tab.key==='chat'" class="h-4 w-4" viewBox="0 0 24 24" fill="currentColor"><path d="M21 11.5A8.5 8.5 0 0 1 12.5 20H8l-5 4 1.5-6A8.5 8.5 0 0 1 21 11.5Z"/></svg>
              <svg v-else class="h-4 w-4" viewBox="0 0 24 24" fill="currentColor"><path d="M16 11a4 4 0 1 0-8 0 4 4 0 0 0 8 0ZM6 18a6 6 0 0 1 12 0v1H6v-1Z"/></svg>
              {{ tab.label }}
            </button>
          </div>
          <div class="flex-1 overflow-hidden min-h-[320px]">
            <TranscriptPanel v-if="activeTab==='transcript'" :transcripts="transcripts" :user-target-lang="targetLang" />
            <ChatPanel v-else-if="activeTab==='chat'" :messages="chatMessages" @send="sendChat" />
            <div v-else class="h-full overflow-y-auto p-4 space-y-2">
              <div v-for="p in participants" :key="p.socketId" class="flex items-center gap-3 p-3 rounded-[16px] border border-zinc-200 dark:border-white/10 bg-zinc-50 dark:bg-white/[0.02]">
                <div class="w-10 h-10 rounded-full bg-[#FF4D00] text-white grid place-items-center font-black">{{ (p.name||'?')[0].toUpperCase() }}</div>
                <div class="flex-1">
                  <div class="flex items-center gap-1.5 text-sm font-black">{{ p.name }}<span v-if="p.isSelf" class="text-[10px] px-1.5 py-0.5 rounded bg-[#FF4D00] text-white">أنت</span></div>
                  <div class="text-xs text-zinc-500">{{ LANGUAGES[p.language]?.flag }} {{ LANGUAGES[p.language]?.nativeName }}</div>
                </div>
                <span v-if="p.talking" class="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              </div>
              <p v-if="!participants.length" class="text-center text-sm text-zinc-400 py-8">سيظهر المشاركون هنا</p>
            </div>
          </div>
        </aside>
      </div>
    </div>

    <div v-if="inviteOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" @click.self="inviteOpen=false">
      <div class="w-full max-w-md rounded-[24px] bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 p-6 shadow-2xl">
        <div class="flex items-center justify-between"><h3 class="text-lg font-black">دعوة الطرف الآخر</h3><button @click="inviteOpen=false" class="w-8 h-8 rounded-full grid place-items-center bg-zinc-100 dark:bg-white/10"><svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6L6 18M6 6l12 12"/></svg></button></div>
        <p class="text-sm text-zinc-500 mt-1">أرسل هذا الرابط — يفتح الغرفة مباشرة.</p>
        <div class="mt-4 rounded-[16px] border border-dashed border-zinc-300 dark:border-white/15 bg-zinc-50 dark:bg-white/[0.02] p-3 text-center"><div class="text-[11px] font-black tracking-widest text-zinc-400">رمز الغرفة</div><div class="text-[20px] font-black tracking-[0.32em] text-[#FF4D00] select-all">{{ roomCode }}</div></div>
        <div class="mt-3 relative"><input :value="inviteUrl" readonly @click="selectInvite" dir="ltr" class="w-full h-12 rounded-[14px] border border-zinc-200 dark:border-white/10 bg-zinc-50 dark:bg-white/5 px-4 pe-20 font-mono text-sm focus:border-[#FF4D00] outline-none" /><button @click="doCopyInvite" class="absolute left-1 top-1 bottom-1 px-4 rounded-[12px] bg-[#FF4D00] text-white text-xs font-black">{{ copied ? 'تم ✓' : 'نسخ' }}</button></div>
        <button @click="inviteOpen=false" class="mt-3 w-full h-11 rounded-[14px] bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 font-black">تم</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { LANGUAGES } from '~/composables/languages';
import { useVoiceTranslator } from '~/composables/useVoiceTranslator';
import { useSocket } from '~/composables/useSocket';
import { useTheme } from '~/composables/useTheme';
const route = useRoute();
const router = useRouter();
const theme = useTheme();
const roomCode = computed<string>(() => String(route.params.code || '').toUpperCase());
const name = ref('');
const myLang = ref('ar');
const targetLang = ref('en');
const started = ref(false);
const connecting = ref(false);
const errorMsg = ref('');
const micOn = ref(false);
const cameraOn = ref(false);
const mediaError = ref('');
const selfStream = ref<MediaStream | null>(null);
const activeTab = ref<'transcript' | 'chat' | 'participants'>('transcript');
const inviteOpen = ref(false);
const copied = ref(false);
const manualTranscript = ref('');
const tabs = [
  { key: 'transcript', label: 'النص' },
  { key: 'chat', label: 'الدردشة' },
  { key: 'participants', label: 'المشاركون' },
];
const participants = ref<any[]>([]);
const transcripts = ref<any[]>([]);
const chatMessages = ref<any[]>([]);
const videoFrames = ref<Record<string,string>>({});
let frameTimer: any = null;
const mySocketId = computed(() => socket.value?.id || '');
const translator = useVoiceTranslator({
  myLang: myLang.value,
  myTargetLang: targetLang.value,
  onFinalText: (text, fromLang) => { handleSelfText(text, fromLang); },
});
const { socket, connect, on, emit, disconnect } = useSocket();
// Expose for e2e debug (Playwright)
if (typeof window !== 'undefined') {
  (window as any).__talkbridgeEmit = emit;
  (window as any).__talkbridgeTranscripts = transcripts;
  (window as any).__talkbridgeChat = chatMessages;
}
function startCallPreset() {
  if (!name.value.trim()) { errorMsg.value = 'يرجى إدخال اسمك'; return; }
  if (!roomCode.value) { errorMsg.value = 'رمز غرفة غير صالح'; return; }
  translator.setMyLang(myLang.value);
  translator.setMyTargetLang(targetLang.value);
  started.value = true;
  enterRoom();
  enableDevices();
}
function enterRoom() {
  connecting.value = true;
  errorMsg.value = '';
  participants.value = [{ socketId: socket.value?.id || 'self', name: name.value.trim(), language: myLang.value, targetLanguage: targetLang.value, isSelf: true }];
  connect(roomCode.value, name.value.trim(), myLang.value, targetLang.value);
  setupSocketListeners();
  connecting.value = false;
}
async function enableDevices() {
  if (!navigator.mediaDevices?.getUserMedia) { mediaError.value = 'المتصفح لا يدعم الكاميرا/الميكروفون'; return; }
  // Unlock speechSynthesis for later remote audio (requires user gesture)
  try {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.getVoices();
      const unlock = new SpeechSynthesisUtterance(' ');
      unlock.volume = 0;
      window.speechSynthesis.speak(unlock);
      window.speechSynthesis.cancel();
    }
  } catch {}
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    selfStream.value = stream;
    cameraOn.value = true;
    micOn.value = true;
    translator.startMic();
    mediaError.value = '';
    setTimeout(() => startVideoFrames(), 600);
  } catch (e: any) {
    console.warn('[media] permission denied/unavailable', e);
    mediaError.value = 'لم يتم منح إذن الكاميرا/الميكروفون. فعّلهما من شريط العنوان ثم اضغط الكاميرا.';
    try { translator.startMic(); micOn.value = true; } catch {}
  }
}
function toggleCamera() {
  if (selfStream.value) {
    const tracks = selfStream.value.getVideoTracks();
    if (cameraOn.value) { tracks.forEach((t) => t.enabled = false); cameraOn.value = false; stopVideoFrames(); }
    else { tracks.forEach((t) => t.enabled = true); cameraOn.value = true; startVideoFrames(); }
    if (micOn.value) { selfStream.value.getAudioTracks().forEach((t) => t.enabled = true); }
  } else { enableDevices(); }
}
function toggleMic() {
  if (!micOn.value) { micOn.value = true; if (selfStream.value) selfStream.value.getAudioTracks().forEach((t) => t.enabled = true); translator.startMic(); }
  else { micOn.value = false; if (selfStream.value) selfStream.value.getAudioTracks().forEach((t) => t.enabled = false); translator.stop(); }
}
function startVideoFrames() {
  // Disabled temporarily to avoid WS flood — remote video will show as avatar
  // TODO: re-enable with lower frequency after text/audio stabilized
  return;
  // stopVideoFrames();
  // frameTimer = setInterval(() => {
  //   if (!cameraOn.value || !selfStream.value) return;
  //   try {
  //     const video = document.querySelector('video') as HTMLVideoElement;
  //     if (!video || video.videoWidth === 0) return;
  //     const canvas = document.createElement('canvas');
  //     canvas.width = 320; canvas.height = 180;
  //     const ctx = canvas.getContext('2d'); if (!ctx) return;
  //     ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
  //     const frame = canvas.toDataURL('image/jpeg', 0.55);
  //     if (frame.length < 150000) emit('video-frame', { frame });
  //   } catch {}
  // }, 900);
}
function stopVideoFrames() { if (frameTimer) { clearInterval(frameTimer); frameTimer = null; } }
function playJoinSound() {
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = 'sine'; o.frequency.value = 880;
    g.gain.value = 0.08;
    o.connect(g); g.connect(ctx.destination);
    o.start(); g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.25);
    setTimeout(() => { try { o.stop(); ctx.close(); } catch {} }, 300);
  } catch {}
}
function setupSocketListeners() {
  on('room-state', (data) => {
    const list = Array.isArray(data?.participants) ? data.participants : [];
    const prevCount = participants.value.filter(p=>!p.isSelf).length;
    syncParticipants(list);
    const newCount = participants.value.filter(p=>!p.isSelf).length;
    if (newCount > prevCount) playJoinSound();
  });
  on('participant-joined', (data) => {
    const p = data?.participant; if (!p) return;
    const others = participants.value.filter((x) => !x.isSelf);
    const exists = others.some((x) => x.socketId === p.socketId);
    if (!exists) { participants.value = [participants.value.find((x) => x.isSelf), { ...p }].filter(Boolean); playJoinSound(); }
  });
  on('participant-left', (data) => { const id = data?.socketId; participants.value = participants.value.filter((x) => x.socketId !== id || x.isSelf); if (id) delete videoFrames.value[id]; });
  on('transcript-update', (data) => handleRemoteText(data));
  on('translated-audio', (data) => handleTranslatedAudio(data));
  on('chat-message', async (data) => {
    if (!data?.text) return;
    let displayText = data.text;
    // Translate chat to receiver's target language if sender language differs
    if (data.language && data.language !== targetLang.value) {
      try {
        const tr = await translator.translate(data.text, data.language, targetLang.value);
        if (tr && tr.trim()) displayText = tr;
      } catch {}
    }
    chatMessages.value.push({ name: data.name, text: displayText, originalText: data.text, isSelf: false });
    playJoinSound();
  });
  on('video-frame', (data) => { if (data?.socketId && data?.frame && data.socketId !== mySocketId.value) { videoFrames.value[data.socketId] = data.frame; } });
}
function syncParticipants(list: any[]) {
  const self = participants.value.find((x) => x.isSelf);
  const others = list.filter((p: any) => p.socketId !== socket.value?.id).map((p: any) => ({ ...p, isSelf: false }));
  participants.value = [self, ...others].filter(Boolean);
}
function handleSelfText(text: string, fromLang: string) {
  transcripts.value.push({ speakerName: name.value.trim(), speakerLanguage: fromLang, originalText: text, translatedText: '', isSelf: true });
  emit('text-chunk', { text });
}
function sendManualTranscript() {
  const t = manualTranscript.value.trim();
  if (!t) return;
  manualTranscript.value = '';
  handleSelfText(t, myLang.value);
}
async function handleRemoteText(data: any) {
  const original = data?.originalText || '';
  if (!original) return;
  const fromLang = data?.speakerLang || data?.speakerLanguage || myLang.value;
  // Dedupe: transcript-update and translated-audio may both arrive for the same chunk.
  const dup = transcripts.value.some((t) => !t.isSelf && (t.socketId || '') === (data?.chunkId || '') );
  if (dup) return;
  // Display the original immediately; the translated text + voice arrive via
  // translated-audio (server-side HF translation + Edge TTS) shortly after.
  transcripts.value.push({ socketId: data?.chunkId || '', speakerName: data?.speakerName || 'طرف آخر', speakerLanguage: fromLang, originalText: original, translatedText: '', isSelf: false });
}
function handleTranslatedAudio(data: any) {
  const text = (data?.translatedText && String(data.translatedText).trim()) || data?.originalText || '';
  const lang = data?.speakerLang || data?.speakerLanguage || myLang.value;
  if (!text || !data?.speakerName) return;
  // Update the pending transcript entry (matched by socketId) with the translation.
  let found = false;
  const target = data?.chunkId || '';
  for (const t of transcripts.value) {
    if (!t.isSelf && t.socketId && t.socketId === target) { t.translatedText = text; found = true; break; }
  }
  // Fallback append if not matched.
  if (!found) {
    const already = transcripts.value.some((t) => !t.isSelf && t.originalText === data.originalText && t.speakerName === data.speakerName);
    if (!already) transcripts.value.push({ socketId: target, speakerName: data.speakerName || 'طرف آخر', speakerLanguage: lang, originalText: data.originalText || '', translatedText: text, isSelf: false });
  }
  if (data?.audioBase64) {
    try {
      if (typeof window !== 'undefined') (window as any).__talkbridgeLastAudio = { len: data.audioBase64.length, ts: Date.now() };
      const audio = new Audio(`data:audio/mp3;base64,${data.audioBase64}`);
      audio.play().catch(()=>{});
    } catch (e) {}
    return;
  }
  // No server audio — fall back to local speechSynthesis so audio always plays.
  try { translator.speak(text, targetLang.value); } catch (e) {}
}
function sendChat(payload: { text: string }) {
  if (!payload.text.trim()) return;
  chatMessages.value.push({ name: name.value.trim(), text: payload.text, originalText: payload.text, isSelf: true });
  emit('chat', { name: name.value.trim(), text: payload.text, language: myLang.value });
}
function openInvite() { inviteOpen.value = true; copied.value = false; }
const inviteUrl = computed<string>(() => { if (typeof window === 'undefined') return ''; return `${window.location.origin}/join/${roomCode.value}`; });
function selectInvite(e: Event) { const el = e.target as HTMLInputElement; el?.select(); }
function doCopyInvite() {
  const url = inviteUrl.value;
  const copy = (txt: string) => {
    if (navigator.clipboard && window.isSecureContext) return navigator.clipboard.writeText(txt);
    return new Promise<void>((resolve, reject) => {
      const ta = document.createElement('textarea'); ta.value = txt; ta.style.position = 'fixed'; ta.style.opacity = '0';
      document.body.appendChild(ta); ta.select();
      try { document.execCommand('copy'); resolve(); } catch (e) { reject(e); }
      document.body.removeChild(ta);
    });
  };
  copy(url).then(() => { copied.value = true; setTimeout(() => (copied.value = false), 2000); }).catch(() => { copied.value = true; });
}
function stopDevices() { stopVideoFrames(); if (selfStream.value) { selfStream.value.getTracks().forEach((t) => t.stop()); selfStream.value = null; } cameraOn.value = false; micOn.value = false; videoFrames.value = {}; }
function leaveRoom() { stopDevices(); translator.stop(); try { disconnect(); } catch (e) {} started.value = false; }
function confirmLeave() { if (window.confirm('هل تريد مغادرة المكالمة؟')) { leaveRoom(); router.push('/'); } }
function leaveToHome() { leaveRoom(); router.push('/'); }
const gridParticipants = computed(() => {
  const standIn = participants.value.map((p) => ({ ...p, frame: videoFrames.value[p.socketId || ''] || null }));
  const selfIdx = standIn.findIndex((p) => p.isSelf);
  if (selfIdx >= 0) standIn[selfIdx].videoOn = cameraOn.value;
  return standIn;
});
onMounted(() => {
  theme.init();
  const q = route.query;
  if (q.name) name.value = String(q.name);
  if (q.lang && LANGUAGES[String(q.lang)]) myLang.value = String(q.lang);
  if (q.targetLang && LANGUAGES[String(q.targetLang)]) { targetLang.value = String(q.targetLang); }
  else { const savedLang = localStorage.getItem('talkbridge-target-lang'); if (savedLang && LANGUAGES[savedLang]) targetLang.value = savedLang; }
  if (q.name && q.lang) startCallPreset();
});
onUnmounted(() => { try { leaveRoom(); } catch (e) {} });
</script>

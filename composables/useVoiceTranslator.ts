import { ref, onUnmounted } from 'vue';

/**
 * useVoiceTranslator — the core of TalkBridge's WebRTC-free flow.
 *
 * Each browser captures audio LOCALLY (mic or tab/system audio via screen
 * share) and never sends raw audio to anyone. The pipeline is 100% in-browser:
 *
 *   1. Capture audio  → getUserMedia (mic) OR getDisplayMedia (tab/system audio)
 *   2. Speech-to-Text → Web Speech API (free, runs on the user's machine/network)
 *   3. Translate      → client-side free provider (MyMemory / Google / HF NLLB)
 *   4. Speak          → window.speechSynthesis in the LISTENER's own language
 *
 * The result: every participant speaks in their own language and hears a
 * translated VOICE (plus a live text transcript) in their own language — no
 * WebRTC media relay, no TURN, no broken peer connections.
 *
 * Only the final TEXT is relayed to other participants over the existing
 * WebSocket signaling channel so they can translate + speak it themselves.
 */

type LangCode = string;

// BCP-47 tags for Web Speech Recognition + Synthesis.
const BCP47: Record<string, string> = {
  ar: 'ar-SA', en: 'en-US', fr: 'fr-FR', es: 'es-ES', de: 'de-DE',
  zh: 'zh-CN', hi: 'hi-IN', pt: 'pt-BR', ru: 'ru-RU', tr: 'tr-TR',
  it: 'it-IT', ja: 'ja-JP', ko: 'ko-KR', nl: 'nl-NL', pl: 'pl-PL'
};

export function useVoiceTranslator(opts: {
  /** The language THIS user speaks (source for their own mic). */
  myLang: LangCode;
  /** The language THIS user wants to HEAR/READ (target). */
  myTargetLang: LangCode;
  /** Called when a final sentence has been recognized from this user's mic. */
  onFinalText?: (text: string, fromLang: LangCode) => void;
}) {
  const myLang = ref(opts.myLang);
  const myTargetLang = ref(opts.myTargetLang);

  const listening = ref(false);
  const source = ref<'mic' | 'tab' | null>(null);
  const interimText = ref('');
  const errorMsg = ref('');
  const speaking = ref(false);

  let recognition: any = null;
  let stream: MediaStream | null = null;
  let silenceTimer: any = null;
  let voicesReady = false;

  /* ---------------------------------------------------------------------- */
  /* 1. AUDIO CAPTURE                                                        */
  /* ---------------------------------------------------------------------- */

  async function startMic() {
    stopStream();
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
      source.value = 'mic';
      errorMsg.value = '';
      startRecognition();
    } catch (e: any) {
      errorMsg.value = `Mic unavailable: ${e?.message || e}`;
    }
  }

  async function startTabAudio() {
    stopStream();
    try {
      // getDisplayMedia with audio captures the tab/system sound the user picks.
      // Chrome prompts the user to share "Tab"/"Window"/"System audio".
      const md = (navigator.mediaDevices as any).getDisplayMedia;
      if (!md) {
        errorMsg.value = 'Tab audio capture is not supported in this browser (use Chrome).';
        return;
      }
      stream = await md({ video: true, audio: true });
      source.value = 'tab';
      errorMsg.value = '';
      startTabRecorder(stream);
    } catch (e: any) {
      errorMsg.value = `Tab audio cancelled or unavailable: ${e?.message || e}`;
      source.value = null;
    }
  }

  // Web Speech API always uses the DEFAULT mic, so it cannot transcribe a
  // captured tab stream. Instead we record the display-media audio with
  // MediaRecorder and POST each chunk to the free /api/stt endpoint (HF Whisper).
  let recorder: MediaRecorder | null = null;
  let recTimer: any = null;
  function startTabRecorder(media: MediaStream) {
    try {
      const audioTracks = media.getAudioTracks();
      if (audioTracks.length === 0) {
        errorMsg.value = 'No audio track in the shared tab. Pick "Share tab audio" when prompted.';
        source.value = null;
        return;
      }
      const audioOnly = new MediaStream(audioTracks);
      recorder = new MediaRecorder(audioOnly, { mimeType: 'audio/webm' });
      const chunks: BlobPart[] = [];

      recorder.ondataavailable = async (e: BlobEvent) => {
        if (e.data && e.data.size > 0) {
          chunks.push(e.data);
          const blob = new Blob(chunks.splice(0), { type: 'audio/webm' });
          const b64 = await blobToBase64(blob);
          try {
            const res = await fetch('/api/stt', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ audioBase64: b64 })
            });
            const j = await res.json();
            const text = (j?.text || '').trim();
            if (text) opts.onFinalText?.(text, myLang.value);
          } catch (err) {
            console.warn('[tab-stt] chunk failed', err);
          }
        }
      };
      recorder.onstop = () => { listening.value = false; };
      recorder.start(4000); // emit a chunk every 4s
      listening.value = true;
    } catch (e: any) {
      errorMsg.value = `Tab recorder failed: ${e?.message || e}`;
    }
  }

  function blobToBase64(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = String(reader.result || '');
        // Strip the data: prefix so the server decoder is simple.
        resolve(result.replace(/^data:audio\/\w+;base64,/, ''));
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }

  function stopStream() {
    if (stream) {
      stream.getTracks().forEach(t => t.stop());
      stream = null;
    }
  }

  /* ---------------------------------------------------------------------- */
  /* 2. SPEECH-TO-TEXT (Web Speech API)                                      */
  /* ---------------------------------------------------------------------- */

  function ensureVoices() {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.getVoices();
    if (!voicesReady) {
      voicesReady = true;
      window.speechSynthesis.onvoiceschanged = () => window.speechSynthesis.getVoices();
    }
  }

  function startRecognition() {
    const SpeechR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechR) {
      errorMsg.value = 'This browser has no live speech recognition. Try Chrome/Edge.';
      return;
    }
    recognition = new SpeechR();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = BCP47[myLang.value] || 'en-US';
    recognition.maxAlternatives = 1;

    recognition.onstart = () => { listening.value = true; errorMsg.value = ''; };
    recognition.onerror = (e: any) => {
      if (e.error === 'no-speech' || e.error === 'aborted') return;
      errorMsg.value = `Speech error: ${e.error}`;
      if (e.error === 'not-allowed') listening.value = false;
    };
    recognition.onend = () => {
      // Auto-restart for continuous listening (only while we intend to listen).
      if (listening.value) { try { recognition.start(); } catch (e) {} }
    };
    recognition.onresult = (event: any) => {
      let interim = '';
      let finalChunk = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const trans = event.results[i][0].transcript;
        if (event.results[i].isFinal) finalChunk += trans;
        else interim += trans;
      }
      interimText.value = interim || '';
      if (finalChunk.trim() !== '') {
        const text = finalChunk.trim();
        interimText.value = '';
        opts.onFinalText?.(text, myLang.value);
      }
    };

    try { recognition.start(); listening.value = true; } catch (e) { /* already started */ }
  }

  /* ---------------------------------------------------------------------- */
  /* 3. TRANSLATE (client-side free providers)                              */
  /* ---------------------------------------------------------------------- */

  async function translate(text: string, from: LangCode, to: LangCode): Promise<string> {
    if (!text || !text.trim()) return text;
    if ((from || 'en') === (to || 'en')) return text;
    const s = String(from || 'en').split('-')[0];
    const t = String(to || 'en').split('-')[0];

    // 1) MyMemory — CORS-enabled, uses the user's own IP (no shared-IP quota issue).
    try {
      const res = await fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${s}|${t}`);
      const j = await res.json();
      const out = j?.responseData?.translatedText || j?.translatedText;
      if (out && !/MYMEMORY WARNING/i.test(out)) return String(out).trim();
    } catch (e) { console.warn('[translate] MyMemory failed', e); }

    // 2) HuggingFace NLLB-200 (free, no key) — good for non-English pairs.
    try {
      const NLLB: Record<string, string> = {
        ar: 'arb_Arab', en: 'eng_Latn', fr: 'fra_Latn', es: 'spa_Latn', de: 'deu_Latn',
        zh: 'zho_Hans', hi: 'hin_Deva', pt: 'por_Latn', ru: 'rus_Cyrl', tr: 'tur_Latn'
      };
      const body = { inputs: text, parameters: { src_lang: NLLB[s] || 'eng_Latn', tgt_lang: NLLB[t] || 'eng_Latn' } };
      const res = await fetch(`https://api-inference.huggingface.co/models/facebook/nllb-200-distilled-600M`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body), signal: AbortSignal.timeout(60000)
      });
      const j = await res.json();
      const out = Array.isArray(j) ? (j[0]?.translation_text || j[0]?.generated_text) : (j?.translation_text || j?.generated_text);
      if (out && String(out).trim()) return String(out).trim();
    } catch (e) { console.warn('[translate] HF NLLB failed', e); }

    return '';
  }

  /* ---------------------------------------------------------------------- */
  /* 4. SPEAK (in the listener's own language)                              */
  /* ---------------------------------------------------------------------- */

  function pickVoice(lang: LangCode) {
    const bcp = BCP47[lang] || BCP47.en;
    const prefix = bcp.split('-')[0].toLowerCase();
    const voices = window.speechSynthesis.getVoices();
    let match = voices.find((v: any) => (v.lang || '').replace('_', '-').toLowerCase().startsWith(prefix));
    if (match) return match;
    match = voices.find((v: any) => (v.lang || '').toLowerCase().split('-')[0] === prefix);
    return match || null;
  }

  async function speak(text: string, lang: LangCode) {
    if (!text || !('speechSynthesis' in window)) return;
    ensureVoices();
    await new Promise<void>((resolve) => {
      try { window.speechSynthesis.cancel(); } catch (e) {}
      const utter = new SpeechSynthesisUtterance(text);
      utter.lang = BCP47[lang] || BCP47.en;
      const voice = pickVoice(lang);
      if (voice) utter.voice = voice;
      utter.rate = 1; utter.pitch = 1;
      let settled = false;
      const finish = () => { if (!settled) { settled = true; speaking.value = false; resolve(); } };
      utter.onstart = () => { speaking.value = true; };
      utter.onend = finish;
      utter.onerror = finish;
      setTimeout(finish, 15000);
      try { window.speechSynthesis.speak(utter); } catch (e) { finish(); }
    });
  }

  /* ---------------------------------------------------------------------- */
  /* lifecycle                                                              */
  /* ---------------------------------------------------------------------- */

  function stop() {
    listening.value = false;
    if (recognition) { try { recognition.abort(); recognition.stop(); } catch (e) {} recognition = null; }
    if (recorder) { try { recorder.stop(); } catch (e) {} recorder = null; }
    if (recTimer) { clearTimeout(recTimer); recTimer = null; }
    stopStream();
    if ('speechSynthesis' in window) { try { window.speechSynthesis.cancel(); } catch (e) {} }
    speaking.value = false;
  }

  onUnmounted(stop);

  return {
    listening, source, interimText, errorMsg, speaking,
    startMic, startTabAudio, stop,
    translate, speak,
    setMyLang: (l: LangCode) => { myLang.value = l; if (recognition) recognition.lang = BCP47[l] || 'en-US'; },
    setMyTargetLang: (l: LangCode) => { myTargetLang.value = l; }
  };
}

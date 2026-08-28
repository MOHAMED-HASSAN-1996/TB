/**
 * POST /api/stt — free Speech-to-Text for captured tab/system audio.
 *
 * The browser cannot feed an arbitrary MediaStream into the Web Speech API
 * (it always uses the default mic), so for "Tab Audio" translation we record
 * the display-media stream with MediaRecorder and POST each chunk here. This
 * uses the SAME free provider chain as the rest of TalkBridge:
 *   - HuggingFace Whisper (free, no key) is the default.
 *   - Groq Whisper is a fast fallback when GROQ_API_KEY is set.
 *
 * Body: { audioBase64: string }  (raw base64 of a webm/opus chunk)
 * Response: { text: string, language?: string }
 */
import { processAudioBuffer } from '../utils/transcribe';

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event);
    const audio = body?.audioBase64 || '';
    if (!audio || !audio.trim()) return { text: '' };
    const result = await processAudioBuffer(audio);
    return { text: result.text || '', language: result.language || '' };
  } catch (e: any) {
    console.error('[stt] error', e?.message || e);
    return { text: '', error: e?.message || 'stt_failed' };
  }
});

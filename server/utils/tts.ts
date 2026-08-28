import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { randomUUID } from 'node:crypto';
import { readFile, unlink } from 'node:fs/promises';

// Lazy-loaded so node-edge-tts (a Node-oriented CJS package with CLI deps
// like ws / yargs) is not pulled into the WebSocket module graph eagerly,
// which otherwise breaks Workers bundling at module-init time.
export async function generateTTS(text: string, targetLang: string): Promise<string> {
  const voiceMap: Record<string, string> = {
    'ar': 'ar-SA-ZariyahNeural',
    'en': 'en-US-JennyNeural', 
    'fr': 'fr-FR-DeniseNeural',
    'es': 'es-ES-ElviraNeural',
    'de': 'de-DE-KatjaNeural',
    'zh': 'zh-CN-XiaoxiaoNeural',
    'hi': 'hi-IN-SwaraNeural',
    'pt': 'pt-BR-FranciscaNeural',
    'ru': 'ru-RU-SvetlanaNeural',
    'tr': 'tr-TR-EmelNeural'
  };

  const voice = voiceMap[targetLang] || 'en-US-JennyNeural';
  const tempFilePath = join(tmpdir(), `${randomUUID()}.mp3`);
  
  try {
    const { EdgeTTS } = await import('node-edge-tts');
    const tts = new EdgeTTS({
      voice: voice,
      lang: voice.split('-').slice(0, 2).join('-'), // "en-US"
      outputFormat: 'audio-24khz-48kbitrate-mono-mp3',
    });
    // Write text to mp3
    // Note: The structure of edge-tts npm package sometimes requires calling specific methods
    // We will use standard syntax
    await tts.ttsPromise(text, tempFilePath);
    const audioBuffer = await readFile(tempFilePath);
    await unlink(tempFilePath).catch(() => {});
    return audioBuffer.toString('base64');
  } catch (error) {
    console.error("edge-tts error. Falling back to simple base64 output if needed. Error:", error);
    try { await unlink(tempFilePath).catch(() => {}) } catch (e) {}
    throw error;
  }
}

import { joinRoom, leaveRoom, getRoomParticipants } from '../utils/rooms';
import { translateText } from '../utils/translate';
import { generateTTS } from '../utils/tts';
import { broadcast, sendTo, unregisterSse } from '../utils/sseHub';

export default defineEventHandler(async (event) => {
  const body: any = await readBody(event);
  const type = body?.type;
  const room = String(body?.room || '').toUpperCase().trim();
  const socketId = String(body?.socketId || '').trim();

  if (!type || !room || !socketId) {
    throw createError({ statusCode: 400, statusMessage: 'type, room, socketId required' });
  }

  switch (type) {
    case 'join-room': {
      const { name, language, targetLanguage, provider } = body;
      const participant = {
        socketId,
        name,
        language,
        targetLanguage: targetLanguage || language,
        provider: provider || 'auto'
      };
      joinRoom(room, participant);
      broadcast(room, 'participant-joined', { participant }, socketId);
      const participants = getRoomParticipants(room);
      broadcast(room, 'room-state', { participants });
      return { ok: true, participants };
    }

    case 'text-chunk': {
      const { text } = body;
      const participants = getRoomParticipants(room);
      const sender = participants.find(p => p.socketId === socketId);
      if (!sender || !text?.trim()) return { ok: true };

      broadcast(room, 'transcript-update', {
        speakerName: sender.name,
        originalText: text,
        translations: []
      }, socketId);

      for (const participant of participants) {
        if (participant.socketId === socketId) continue;
        (async () => {
          let translatedText = text;
          try {
            if (participant.targetLanguage !== sender.language) {
              translatedText = await translateText(text, sender.language, participant.targetLanguage, participant.provider);
            }
          } catch (e) { console.error('[action] translate error', e); }

          let audioBase64 = '';
          try {
            audioBase64 = await Promise.race([
              generateTTS(translatedText, participant.targetLanguage),
              new Promise<string>((_, r) => setTimeout(() => r(''), 8000))
            ]);
          } catch (e) { console.error('[action] tts error', e); }

          sendTo(participant.socketId, 'translated-audio', {
            audioBase64: audioBase64 || '',
            speakerName: sender.name,
            originalText: text,
            translatedText
          });
        })();
      }
      return { ok: true };
    }

    case 'rtc-signal': {
      const { signal, to } = body;
      if (to) {
        sendTo(to, 'rtc-signal', { from: socketId, signal, room });
      } else {
        broadcast(room, 'rtc-signal', { from: socketId, signal, room }, socketId);
      }
      return { ok: true };
    }

    case 'leave-room': {
      leaveRoom(socketId);
      unregisterSse(socketId);
      broadcast(room, 'participant-left', { socketId });
      broadcast(room, 'rtc-peer-left', { socketId });
      const remaining = getRoomParticipants(room);
      if (remaining.length > 0) broadcast(room, 'room-state', { participants: remaining });
      return { ok: true };
    }

    default:
      throw createError({ statusCode: 400, statusMessage: 'unknown action type' });
  }
});

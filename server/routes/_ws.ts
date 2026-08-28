/**
 * WebSocket signaling endpoint (Nitro/crossws) — /_ws — for Cloudflare Workers
 * (free) + any Node host. Replaces the SSE stream+POST-action pairing with one
 * persistent WebSocket connection.
 *
 * Connect from the client with:
 *   new WebSocket(`${wsBase}/_ws?room=..&socketId=..`)
 *
 * The client sends JSON action messages:
 *   { type: 'join-room' | 'text-chunk' | 'rtc-signal' | 'leave-room', ... }
 * and receives framed events:
 *   { type: <event>, data: {...} }
 *
 * Event/action names and payloads match the old SSE hub so the page /
 * useWebRTC consumers need no changes.
 */

import { joinRoom, leaveRoom, getRoomParticipants } from '../utils/rooms';

import { generateTTS } from '../utils/tts';
import { registerPeer, unregisterPeer, broadcastFrom, sendTo, sendToPeer, getPeerCtx, setPeerCtx } from '../utils/wsHub';

export default defineWebSocketHandler({
  open(peer) {
    // Room + socketId are carried in the first "join-room" message (the client
    // sends it right after connecting), so we register the peer there.
  },

  async message(peer, message) {
    let body: any;
    try {
      // crossws passes a Message object with .text()/.json() helpers; on the
      // node adapter it may also arrive as a plain string.
      let data: string;
      if (typeof message === 'string') {
        data = message;
      } else if (typeof (message as any)?.text === 'function') {
        data = (message as any).text();
      } else {
        data = String(message);
      }
      body = JSON.parse(data);
    } catch (e) {
      console.error('[ws] bad message', e);
      return;
    }
    const type = body?.type;
    const ctx = getPeerCtx(peer);
    const room = (ctx.room || '').toUpperCase().trim();
    const socketId = ctx.socketId || '';

    switch (type) {
      case 'join-room': {
        const { name, language, targetLanguage, provider, socketId: sid, room: roomCode } = body || {};
        const myRoom = String(roomCode || '').toUpperCase().trim();
        const myId = String(sid || '').trim();
        if (!myRoom || !myId) return;
        // Track this peer's room + socketId (stored in a WeakMap — peer.context
        // is read-only on the Cloudflare DO adapter).
        setPeerCtx(peer, myRoom, myId);
        registerPeer(peer, myRoom, myId);

        const participant = {
          socketId: myId,
          name,
          language,
          targetLanguage: targetLanguage || language,
          provider: provider || 'auto'
        };
        joinRoom(myRoom, participant);
        broadcastFrom(peer, myRoom, 'participant-joined', { participant }, myId);
        const participants = getRoomParticipants(myRoom);
        // Send the full room state to the joining peer directly (the topic
        // subscription may not be active yet). Existing peers pick up the
        // change via participant-joined.
        if (participants.length > 0) sendToPeer(peer, 'room-state', { participants });
        broadcastFrom(peer, myRoom, 'room-state', { participants }, myId);
        return;
      }

      case 'text-chunk': {
        const { text } = body || {};
        const participants = getRoomParticipants(room);
        const sender = participants.find((p: any) => p.socketId === socketId);
        if (!sender || !text?.trim()) return;

        broadcastFrom(peer, room, 'transcript-update', {
          speakerName: sender.name,
          originalText: text,
          translations: []
        }, socketId);

        for (const participant of participants) {
          if (participant.socketId === socketId) continue;
          (async () => {
            // Translation now happens on the client (browser network) for
            // reliability on Cloudflare's shared egress IP. The server just
            // relays the original text; the client translates + speaks it.
            const translatedText = text;

            let audioBase64 = '';
            try {
              audioBase64 = await Promise.race([
                generateTTS(translatedText, participant.targetLanguage),
                new Promise<string>((_, r) => setTimeout(() => r(''), 8000))
              ]);
            } catch (e) { console.error('[ws] tts error', e); }

            sendTo(peer, participant.socketId, 'translated-audio', {
              audioBase64: audioBase64 || '',
              speakerName: sender.name,
              originalText: text,
              translatedText
            });
          })();
        }
        return;
      }

      case 'rtc-signal': {
        const { signal, to } = body || {};
        if (to) {
          sendTo(peer, to, 'rtc-signal', { from: socketId, signal, room });
        } else {
          broadcastFrom(peer, room, 'rtc-signal', { from: socketId, signal, room }, socketId);
        }
        return;
      }

      case 'leave-room': {
        leaveRoom(socketId);
        unregisterPeer(socketId);
        broadcastFrom(peer, room, 'participant-left', { socketId }, socketId);
        broadcastFrom(peer, room, 'rtc-peer-left', { socketId }, socketId);
        const remaining = getRoomParticipants(room);
        if (remaining.length > 0) broadcastFrom(peer, room, 'room-state', { participants: remaining }, socketId);
        peer.close(1000, 'left');
        return;
      }

      default:
        return;
    }
  },

  close(peer) {
    const ctx = getPeerCtx(peer);
    const room = (ctx.room || '').toUpperCase().trim();
    const socketId = ctx.socketId || '';
    if (socketId) {
      leaveRoom(socketId);
      unregisterPeer(socketId);
      broadcastFrom(peer, room, 'participant-left', { socketId }, socketId);
      broadcastFrom(peer, room, 'rtc-peer-left', { socketId }, socketId);
      const remaining = getRoomParticipants(room);
      if (remaining.length > 0) broadcastFrom(peer, room, 'room-state', { participants: remaining }, socketId);
    }
  },

  error(peer, error) {
    console.error('[ws] error', error);
  }
});

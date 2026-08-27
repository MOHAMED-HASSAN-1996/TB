import type { NitroApp } from 'nitropack';
import { Server as EngineServer } from 'engine.io';
import { Server } from 'socket.io';
import { defineEventHandler } from 'h3';
import { getRoomParticipants, joinRoom, leaveRoom } from '../utils/rooms';
import { translateText } from '../utils/translate';
import { generateTTS } from '../utils/tts';

export default defineNitroPlugin((nitroApp: NitroApp) => {
  const engine = new EngineServer();
  const io = new Server();

  // Bind Socket.IO to the Engine.IO instance
  io.bind(engine as any);

  // Route all /_socket/ requests (HTTP polling + WS upgrade) to engine.io
  nitroApp.router.use('/_socket/', defineEventHandler({
    handler(event) {
      engine.handleRequest(event.node.req, event.node.res);
      event._handled = true;
    },
    websocket: {
      open(peer: any) {
        const nodeReq = peer._internal?.nodeReq ?? peer.request;
        if (nodeReq) engine.prepare(nodeReq);
        engine.handleUpgrade(
          peer._internal?.nodeReq ?? peer.request,
          peer._internal?.nodeSocket ?? peer.socket,
          peer._internal?.buffer ?? Buffer.alloc(0)
        );
        event._handled = true;
      }
    }
  } as any));

  console.log('[SocketPlugin] Socket.IO server initialized via engine.io router.');

  io.on('connection', (socket) => {
    console.log(`[Socket] New connection: ${socket.id}`);

    socket.on('join-room', async (data) => {
      const { roomCode, name, language, targetLanguage, provider } = data;
      const upperRoomCode = String(roomCode || '').toUpperCase().trim();

      // Leave previous rooms
      for (const r of socket.rooms) {
        if (r !== socket.id && r !== upperRoomCode) socket.leave(r);
      }
      socket.join(upperRoomCode);

      const roomSize = io.sockets.adapter.rooms.get(upperRoomCode)?.size ?? 0;
      console.log(`[Socket] ${socket.id} (${name}) joined "${upperRoomCode}" | room size: ${roomSize}`);

      const participant = {
        socketId: socket.id,
        name,
        language,
        targetLanguage: targetLanguage || language,
        provider: provider || 'auto'
      };
      joinRoom(upperRoomCode, participant);
      io.to(upperRoomCode).emit('participant-joined', { participant });

      const updatedState = getRoomParticipants(upperRoomCode);
      io.to(upperRoomCode).emit('room-state', { participants: updatedState });
    });

    socket.on('text-chunk', async (data) => {
      const { text, roomCode } = data;
      const upperRoomCode = (roomCode || '').toUpperCase();
      const participants = getRoomParticipants(upperRoomCode);
      const sender = participants.find(p => p.socketId === socket.id);
      if (!sender || !text?.trim()) return;

      console.log(`[Socket] text-chunk from ${sender.name}: "${text}"`);

      // Immediate transcript update for everyone in room
      io.to(upperRoomCode).emit('transcript-update', {
        speakerName: sender.name,
        originalText: text,
        translations: []
      });

      for (const participant of participants) {
        if (participant.socketId === socket.id) continue;

        // Async per-participant translate + TTS
        (async () => {
          let translatedText = text;
          try {
            if (participant.targetLanguage !== sender.language) {
              translatedText = await translateText(text, sender.language, participant.targetLanguage, participant.provider);
            }
          } catch (e) { console.error('[Socket] Translation error', e); }

          let audioBuffer = '';
          try {
            audioBuffer = await Promise.race([
              generateTTS(translatedText, participant.targetLanguage),
              new Promise<string>((_, r) => setTimeout(() => r(''), 8000))
            ]);
          } catch (e) { console.error('[Socket] TTS error', e); }

          io.to(participant.socketId).emit('translated-audio', {
            audioBase64: audioBuffer || '',
            speakerName: sender.name,
            originalText: text,
            translatedText
          });
        })();
      }
    });

    // ===== WebRTC signaling (free, peer-to-peer video) =====
    // Relay SDP offers/answers and ICE candidates between the two peers in a room.
    socket.on('rtc-signal', (data) => {
      const { roomCode, signal, to } = data || {};
      if (!roomCode) return;
      const upperRoomCode = String(roomCode).toUpperCase();
      // Send to the specific peer if `to` is set, otherwise broadcast to the room (except sender).
      if (to) {
        io.to(to).emit('rtc-signal', { from: socket.id, signal, roomCode: upperRoomCode });
      } else {
        socket.to(upperRoomCode).emit('rtc-signal', { from: socket.id, signal, roomCode: upperRoomCode });
      }
      console.debug(`[WebRTC] signal from ${socket.id} -> ${to || 'room'} (${upperRoomCode})`);
    });

    socket.on('disconnect', () => {
      const roomCode = leaveRoom(socket.id);
      if (roomCode) {
        io.to(roomCode).emit('participant-left', { socketId: socket.id });
        // Tell peers to tear down the video connection.
        socket.to(roomCode).emit('rtc-peer-left', { socketId: socket.id });
        const remaining = getRoomParticipants(roomCode);
        if (remaining.length > 0) {
          io.to(roomCode).emit('room-state', { participants: remaining });
        }
        console.log(`[Socket] ${socket.id} disconnected from "${roomCode}" | remaining: ${remaining.length}`);
      }
    });
  });
});

import { io, Socket } from 'socket.io-client';

export const useSocket = () => {
  const socket = useState<Socket | null>('socket', () => null);

  const connect = (roomCode: string, name: string, language: string, targetLanguage: string, provider?: string) => {
    if (!socket.value) {
      const config = useRuntimeConfig();
      const url = config.public.socketUrl || (import.meta.client ? window.location.origin : '');

      socket.value = io(url, { path: '/_socket' });

      socket.value.on('connect', () => {
        const normalized = String(roomCode || '').trim();
        // join-room expects an object with roomCode, name, language, targetLanguage
        socket.value?.emit('join-room', { roomCode: normalized, name, language, targetLanguage, provider });
      });
    } else {
      // If already connected, re-emit join-room with normalized id
      const normalized = String(roomCode || '').trim();
      socket.value.emit('join-room', { roomCode: normalized, name, language, targetLanguage, provider });
    }
  };

  const disconnect = () => {
    if (socket.value) {
      socket.value.disconnect();
      socket.value = null;
    }
  };

  const emitTyping = (roomId: string, text: string, translatedText: string | undefined, userId: string) => {
    if (!socket.value) return;
    socket.value.emit('typing', { roomId: String(roomId || '').trim(), text, translatedText, userId });
  };

  const emitStopTyping = (roomId: string, userId: string) => {
    if (!socket.value) return;
    socket.value.emit('stop-typing', { roomId: String(roomId || '').trim(), userId });
  };

  const sendMessage = (roomId: string, message: string, translatedMessage: string | undefined, userId: string, userName: string) => {
    if (!socket.value) return;
    socket.value.emit('send-message', { roomId: String(roomId || '').trim(), message, translatedMessage, userId, userName });
  };

  return {
    socket,
    connect,
    disconnect
    ,emitTyping, emitStopTyping, sendMessage
  };
};

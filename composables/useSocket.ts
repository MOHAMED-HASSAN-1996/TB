/**
 * useSocket — SSE-based signaling client (no WebSocket, works on HF Spaces free tier).
 *
 * - Opens a long-lived SSE connection to /api/stream?room&socketId to RECEIVE events.
 * - Sends actions (join, text-chunk, rtc-signal, leave) via POST /api/action.
 */

let generatedId = '';
function getSocketId(): string {
  if (!generatedId) generatedId = Math.random().toString(36).substring(2, 10) + Date.now().toString(36);
  return generatedId;
}

export const useSocket = () => {
  const socket = useState<any>('socket', () => null);
  const listeners = useState<Record<string, Function[]>>('socket-listeners', () => ({}));
  let es: EventSource | null = null;
  let currentRoom = '';

  const baseUrl = () => {
    const config = useRuntimeConfig();
    return config.public.socketUrl || (import.meta.client ? window.location.origin : '');
  };

  const on = (event: string, cb: Function) => {
    const map = listeners.value;
    map[event] = map[event] || [];
    map[event].push(cb);
    return () => { map[event] = (map[event] || []).filter(f => f !== cb); };
  };

  const emit = async (type: string, payload: any) => {
    const body = { type, socketId: getSocketId(), room: currentRoom, ...payload };
    try {
      await $fetch('/api/action', { method: 'POST', body });
    } catch (e) {
      console.error('[useSocket] action failed', e);
    }
  };

  const connect = (roomCode: string, name: string, language: string, targetLanguage: string, provider?: string) => {
    currentRoom = String(roomCode || '').trim().toUpperCase();
    const id = getSocketId();

    socket.value = { id, on, emit, close: disconnect };

    // Open SSE stream for receiving events.
    if (import.meta.client && !es) {
      const url = `${baseUrl()}/api/stream?room=${encodeURIComponent(currentRoom)}&socketId=${encodeURIComponent(id)}`;
      es = new EventSource(url);
      es.onmessage = (ev) => {
        // default event; we mostly use named events
        try { dispatch('message', JSON.parse(ev.data)); } catch (e) {}
      };
      es.addEventListener('participant-joined', (ev: any) => dispatch('participant-joined', JSON.parse(ev.data)));
      es.addEventListener('participant-left', (ev: any) => dispatch('participant-left', JSON.parse(ev.data)));
      es.addEventListener('room-state', (ev: any) => dispatch('room-state', JSON.parse(ev.data)));
      es.addEventListener('transcript-update', (ev: any) => dispatch('transcript-update', JSON.parse(ev.data)));
      es.addEventListener('translated-audio', (ev: any) => dispatch('translated-audio', JSON.parse(ev.data)));
      es.addEventListener('rtc-signal', (ev: any) => dispatch('rtc-signal', JSON.parse(ev.data)));
      es.addEventListener('rtc-peer-left', (ev: any) => dispatch('rtc-peer-left', JSON.parse(ev.data)));
      es.onerror = () => { /* EventSource auto-reconnects */ };
    }

    // Join the room.
    emit('join-room', { name, language, targetLanguage, provider });
  };

  const dispatch = (event: string, data: any) => {
    (listeners.value[event] || []).forEach(cb => { try { cb(data); } catch (e) {} });
  };

  const disconnect = () => {
    if (currentRoom) emit('leave-room', {});
    if (es) { es.close(); es = null; }
    socket.value = null;
  };

  return { socket, connect, disconnect, on, emit };
};

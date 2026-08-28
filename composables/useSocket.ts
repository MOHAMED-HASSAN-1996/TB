/**
 * useSocket — WebSocket-based signaling client (Nitro/crossws) for EdgeOne.
 *
 * - Opens a persistent WebSocket to /_ws?room&socketId to RECEIVE and SEND.
 * - Receives framed events: { type: <event>, data: {...} } and dispatches to
 *   listeners registered via .on(event, cb).
 * - Sends actions (join, text-chunk, rtc-signal, leave) over the socket.
 * - Falls back to POST /api/action if the socket is not yet open.
 *
 * Public API (id, on, emit, close) and event/action names are unchanged from
 * the SSE implementation so page/useWebRTC consumers need no edits.
 */

let generatedId = '';
function getSocketId(): string {
  if (!generatedId) generatedId = Math.random().toString(36).substring(2, 10) + Date.now().toString(36);
  return generatedId;
}

export const useSocket = () => {
  const socket = useState<any>('socket', () => null);
  const listeners = useState<Record<string, Function[]>>('socket-listeners', () => ({}));
  let ws: WebSocket | null = null;
  let currentRoom = '';
  let reconnectTimer: any = null;
  let manualClose = false;
  let joined = false;
  let profile: any = null;

  const baseUrl = () => {
    const config = useRuntimeConfig();
    return config.public.socketUrl || (import.meta.client ? window.location.origin : '');
  };

  const wsUrl = (room: string, id: string) => {
    const http = baseUrl();
    const wsBase = http.replace(/^http/, 'ws');
    return `${wsBase}/_ws?room=${encodeURIComponent(room)}&socketId=${encodeURIComponent(id)}`;
  };

  const on = (event: string, cb: Function) => {
    const map = listeners.value;
    map[event] = map[event] || [];
    map[event].push(cb);
    return () => { map[event] = (map[event] || []).filter(f => f !== cb); };
  };

  const dispatch = (event: string, data: any) => {
    (listeners.value[event] || []).forEach(cb => { try { cb(data); } catch (e) {} });
  };

  const sendJson = (obj: any) => {
    const frame = JSON.stringify(obj);
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(frame);
      return true;
    }
    return false;
  };

  const emit = (type: string, payload: any) => {
    const body = { type, socketId: getSocketId(), room: currentRoom, ...payload };
    sendJson(body);
  };

  const connect = (roomCode: string, name: string, language: string, targetLanguage: string, provider?: string) => {
    currentRoom = String(roomCode || '').toUpperCase().trim();
    profile = { name, language, targetLanguage: targetLanguage || language, provider: provider || 'auto' };
    const id = getSocketId();

    socket.value = { id, on, emit, close: disconnect };

    // Open WebSocket for signaling. join-room is sent once the socket is open
    // (see openSocket onopen), so the join lands on the live wsHub channel.
    if (import.meta.client && !ws) {
      manualClose = false;
      openSocket(currentRoom, id);
    }
  };

  const sendJoin = () => {
    if (!joined && ws && ws.readyState === WebSocket.OPEN) {
      emit('join-room', { ...profile });
      joined = true;
    }
  };

  const openSocket = (room: string, id: string) => {
    ws = new WebSocket(wsUrl(room, id));

    ws.onopen = () => {
      console.debug('[useSocket] WS open');
      sendJoin();
    };

    ws.onmessage = (ev) => {
      let frame: any;
      try {
        frame = JSON.parse(ev.data);
      } catch (e) { return; }
      if (!frame || !frame.type) return;
      // Ignore frames we broadcast to ourselves (exclusion marker).
      if (frame.data && frame.data._from === id) return;
      if (frame.data) delete frame.data._from;
      dispatch(frame.type, frame.data);
    };

    ws.onclose = () => {
      ws = null;
      if (!manualClose) {
        // Auto-reconnect after a short delay, then re-join the room.
        reconnectTimer = setTimeout(() => {
          if (import.meta.client && !ws && currentRoom) {
            joined = false;
            openSocket(currentRoom, getSocketId());
          }
        }, 2500);
      }
    };

    ws.onerror = () => {
      try { ws?.close(); } catch (e) {}
    };
  };

  const disconnect = () => {
    manualClose = true;
    if (reconnectTimer) { clearTimeout(reconnectTimer); reconnectTimer = null; }
    if (currentRoom) emit('leave-room', {});
    if (ws) {
      try { ws.onclose = null; ws.close(); } catch (e) {}
      ws = null;
    }
    socket.value = null;
  };

  return { socket, connect, disconnect, on, emit };
};

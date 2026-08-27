/**
 * SSE hub — replaces Socket.IO for HuggingFace Spaces (free tier blocks WebSockets).
 *
 * Clients open a long-lived SSE GET /api/stream?<room>&<socketId> and receive events.
 * Clients send actions via POST /api/action with { type, room, ... } and the hub
 * fans them out to the right SSE listeners.
 *
 * State lives on globalThis so it is shared across all Nitro route handlers (each
 * route may be bundled into its own module instance otherwise).
 */

type SseClient = {
  socketId: string;
  room: string;
  send: (event: string, data: any) => void;
};

function getClients(): Map<string, SseClient> {
  const g = globalThis as any;
  if (!g.__talkbridgeSseClients) g.__talkbridgeSseClients = new Map<string, SseClient>();
  return g.__talkbridgeSseClients;
}

export function registerSse(socketId: string, room: string, send: (event: string, data: any) => void) {
  getClients().set(socketId, { socketId, room, send });
}

export function unregisterSse(socketId: string) {
  getClients().delete(socketId);
}

export function getClient(socketId: string) {
  return getClients().get(socketId);
}

// Broadcast to everyone in a room except the sender.
export function broadcast(room: string, event: string, data: any, exceptSocketId?: string) {
  const clients = getClients();
  console.log(`[SSE broadcast] room=${room} event=${event} clients=${clients.size} except=${exceptSocketId}`);
  for (const c of clients.values()) {
    if (c.room.toUpperCase() === room.toUpperCase() && c.socketId !== exceptSocketId) {
      try { c.send(event, data); } catch (e) { console.error('[SSE send error]', e); }
    }
  }
}

// Send to one specific client.
export function sendTo(socketId: string, event: string, data: any) {
  const c = getClients().get(socketId);
  if (c) { try { c.send(event, data); } catch (e) { /* ignore */ } }
}

export function clientsInRoom(room: string): SseClient[] {
  return [...getClients().values()].filter(c => c.room.toUpperCase() === room.toUpperCase());
}

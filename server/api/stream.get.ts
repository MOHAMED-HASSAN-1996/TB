import { createEventStream } from 'h3';
import { registerSse, unregisterSse } from '../utils/sseHub';

export default defineEventHandler(async (event) => {
  const room = String(getQuery(event).room || '').toUpperCase().trim();
  const socketId = String(getQuery(event).socketId || '').trim();

  if (!room || !socketId) {
    throw createError({ statusCode: 400, statusMessage: 'room and socketId required' });
  }

  // Official Nitro/h3 SSE helper — keeps the connection open and streams events.
  const eventStream = await createEventStream(event);

  const send = (eventName: string, data: any) => {
    try {
      // h3 createEventStream expects whole SSE frames per push.
      eventStream.push(`event: ${eventName}\ndata: ${JSON.stringify(data)}\n\n`);
    } catch (e) { console.error(`[SSE send FAIL] ${socketId}:`, e); }
  };

  registerSse(socketId, room, send);
  console.log(`[SSE] registered socketId=${socketId} room=${room} total=${globalThis.__talkbridgeSseClients?.size}`);

  // Initial comment so the client knows the stream is alive.
  eventStream.push(': connected\n\n');

  const ping = setInterval(() => {
    try { eventStream.push(': ping\n\n'); } catch (e) { /* ignore */ }
  }, 15000);

  const cleanup = () => {
    clearInterval(ping);
    unregisterSse(socketId);
  };
  event.node.req.on('close', () => { cleanup(); eventStream.close?.(); });

  // Return the stream response.
  return eventStream.send();
});

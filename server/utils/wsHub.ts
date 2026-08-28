/**
 * wsHub — WebSocket signaling hub (Nitro/crossws) for EdgeOne + any Node host.
 *
 * Replaces the SSE hub. Each connected WebSocket peer is associated with a
 * room and a socketId. Delivery uses crossws topics (publish/subscribe) which
 * works both on a single-process Node server and on runtimes with a websocket
 * hub (EdgeOne/Cloudflare):
 *
 *   - Room topic   : the room code — every peer in the room subscribes.
 *   - Socket topic : "/s/<socketId>" — exactly one peer subscribes, used for
 *                    direct P2P delivery (rtc-signal with `to`, translated-audio).
 *
 * Peers are kept in a compact map (socketId -> peer) so a joined connection
 * has a peer reference on which to call `.publish()` for its room topic.
 * Outgoing frames are JSON: { type: <eventName>, data: {...} }.
 */

export const msg = (type: string, data: any): string =>
  JSON.stringify({ type, data });

function getPeers(): Map<string, any> {
  const g = globalThis as any;
  if (!g.__talkbridgeWsPeers) g.__talkbridgeWsPeers = new Map<string, any>();
  return g.__talkbridgeWsPeers;
}

const peerCtx = new WeakMap<object, { room?: string; socketId?: string }>();

// Room + socketId for a peer, stored in a WeakMap keyed by the peer object.
// We deliberately do NOT write to peer.context: on the Cloudflare Durable
// Object (HibernatableWebSocket) adapter that property is read-only.
export function getPeerCtx(peer: any): { room?: string; socketId?: string } {
  return peerCtx.get(peer) || {};
}

export function setPeerCtx(peer: any, room: string, socketId: string) {
  peerCtx.set(peer, { room, socketId });
}

function socketTopic(socketId: string) {
  return `/s/${socketId}`;
}

// Associate a peer with its room + socketId and subscribe it to topics.
export function registerPeer(peer: any, room: string, socketId: string) {
  try {
    peer.subscribe(room);
    peer.subscribe(socketTopic(socketId));
  } catch (e) {
    console.error('[wsHub] subscribe fail', e);
  }
  setPeerCtx(peer, room, socketId);
  getPeers().set(socketId, peer);
}

export function unregisterPeer(socketId: string) {
  const peer = getPeers().get(socketId);
  if (peer) {
    try {
      peer.unsubscribe(getPeerCtx(peer).room);
      peer.unsubscribe(socketTopic(socketId));
    } catch (e) { /* ignore */ }
  }
  getPeers().delete(socketId);
}

// Broadcast to everyone subscribed to a room. crossws `peer.publish(topic)`
// fans out to all subscribers of that topic from the same hub.
// We use the joined client's own reference (its hub) to publish.
export function broadcastFrom(fromPeer: any, room: string, event: string, data: any, exceptSocketId?: string) {
  const payload: any = { ...data };
  if (exceptSocketId) payload._from = exceptSocketId;
  const frame = msg(event, payload);
  try {
    fromPeer.publish(room, frame);
  } catch (e) {
    console.error('[wsHub] broadcast fail', e);
  }
}

// Send to one specific socket via its private socket topic.
export function sendTo(fromPeer: any, socketId: string, event: string, data: any) {
  const frame = msg(event, data);
  try {
    fromPeer.publish(socketTopic(socketId), frame);
  } catch (e) {
    console.error('[wsHub] sendTo fail', e);
  }
}

// Send a frame directly to a specific peer object (reliable even before the
// peer's topic subscription is fully registered — used for the self room-state
// delivered right at join-room).
export function sendToPeer(peer: any, event: string, data: any) {
  try {
    peer.send(msg(event, data));
  } catch (e) {
    console.error('[wsHub] sendToPeer fail', e);
  }
}

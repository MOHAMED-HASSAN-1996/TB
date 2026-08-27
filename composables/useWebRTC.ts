import { ref, onUnmounted } from 'vue';

/**
 * useWebRTC — free peer-to-peer video call via the existing Socket.IO signaling channel.
 *
 * - Grabs local camera+mic.
 * - Creates an RTCPeerConnection per remote peer (perfect-negotiation lite for 1-on-1).
 * - Relays SDP/ICE through the `rtc-signal` socket event (handled by server/plugins/socket.ts).
 * - No TURN needed for most home networks (Google STUN). Add a free TURN in nuxt.config if behind symmetric NAT.
 */

export function useWebRTC(opts: {
  socket: any;
  roomCode: string;
  getLocalStream: () => MediaStream | null;
}) {
  const { socket, roomCode, getLocalStream } = opts;

  const remoteStreams = ref<Record<string, MediaStream>>({});
  const connectionState = ref<Record<string, string>>({});
  const error = ref('');

  const pcMap = new Map<string, RTCPeerConnection>();
  let makingOffer = false;
  let ignoreOffer = false;

  const iceServers = () => {
    const cfg = useRuntimeConfig();
    return cfg.public.iceServers || [{ urls: 'stun:stun.l.google.com:19302' }];
  };

  function createPeer(peerId: string, isInitiator: boolean): RTCPeerConnection {
    const pc = new RTCPeerConnection({ iceServers: iceServers() });

    const local = getLocalStream();
    if (local) local.getTracks().forEach((t) => pc.addTrack(t, local));

    pc.onicecandidate = (e) => {
      if (e.candidate) {
        socket.value?.emit('rtc-signal', { roomCode, signal: { candidate: e.candidate }, to: peerId });
      }
    };

    pc.ontrack = (e) => {
      remoteStreams.value = { ...remoteStreams.value, [peerId]: e.streams[0] };
    };

    pc.onconnectionstatechange = () => {
      connectionState.value = { ...connectionState.value, [peerId]: pc.connectionState };
      if (pc.connectionState === 'failed') {
        // Try ICE restart on failure
        pc.restartIce?.();
      }
    };

    pcMap.set(peerId, pc);

    if (isInitiator) {
      // The later joiner initiates the offer.
      (async () => {
        try {
          makingOffer = true;
          const offer = await pc.createOffer();
          await pc.setLocalDescription(offer);
          socket.value?.emit('rtc-signal', { roomCode, signal: { sdp: pc.localDescription }, to: peerId });
        } catch (err) {
          console.error('[WebRTC] createOffer failed', err);
        } finally {
          makingOffer = false;
        }
      })();
    }

    return pc;
  }

  async function handleSignal(from: string, signal: any) {
    let pc = pcMap.get(from);
    // If we don't have a PC yet, the remote is the initiator; create one as non-initiator.
    if (!pc) {
      pc = createPeer(from, false);
    }

    try {
      if (signal.sdp) {
        const desc = signal.sdp;
        const offerCollision =
          desc.type === 'offer' &&
          (makingOffer || pc.signalingState !== 'stable');

        ignoreOffer = offerCollision && !polite();
        if (ignoreOffer) return;

        await pc.setRemoteDescription(desc);
        if (desc.type === 'offer') {
          const answer = await pc.createAnswer();
          await pc.setLocalDescription(answer);
          socket.value?.emit('rtc-signal', { roomCode, signal: { sdp: pc.localDescription }, to: from });
        }
      } else if (signal.candidate) {
        try {
          await pc.addIceCandidate(signal.candidate);
        } catch (err) {
          if (!ignoreOffer) console.error('[WebRTC] addIceCandidate failed', err);
        }
      }
    } catch (err) {
      console.error('[WebRTC] handleSignal error', err);
    }
  }

  // The host (first joiner) is "polite" and yields on collision.
  function polite() {
    return (roomCode || '').length > 0; // both polite; collisions are rare in 1-on-1. Simplest stable path.
  }

  function peerLeft(peerId: string) {
    const pc = pcMap.get(peerId);
    if (pc) { pc.close(); pcMap.delete(peerId); }
    const next = { ...remoteStreams.value }; delete next[peerId]; remoteStreams.value = next;
    const nc = { ...connectionState.value }; delete nc[peerId]; connectionState.value = nc;
  }

  // Wire socket listeners
  function bind() {
    if (!socket.value) return;
    socket.value.on('rtc-signal', (data: any) => {
      if (data.roomCode?.toUpperCase() === String(roomCode).toUpperCase()) {
        handleSignal(data.from, data.signal);
      }
    });
    socket.value.on('rtc-peer-left', (data: any) => peerLeft(data.socketId));
    socket.value.on('participant-joined', (data: any) => {
      // When a new participant joins and we already have a local stream, set up a peer (we are initiator if we were here first).
      const existing = pcMap.get(data.participant.socketId);
      if (!existing && getLocalStream()) {
        createPeer(data.participant.socketId, true);
      }
    });
  }

  function destroy() {
    pcMap.forEach((pc) => pc.close());
    pcMap.clear();
    remoteStreams.value = {};
  }

  onUnmounted(destroy);

  return { remoteStreams, connectionState, error, bind, createPeer, peerLeft, destroy };
}

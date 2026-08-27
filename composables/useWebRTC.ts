import { ref, onUnmounted } from 'vue';

/**
 * useWebRTC — free peer-to-peer video call via the SSE signaling channel.
 *
 * - Grabs local camera+mic.
 * - Creates an RTCPeerConnection per remote peer (1-on-1 negotiation).
 * - Relays SDP/ICE through `socket.emit('rtc-signal', { signal, to })` (POST /api/action).
 * - Receives remote signals via `socket.on('rtc-signal' / 'rtc-peer-left')`.
 * - No TURN needed for most home networks (Google STUN).
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
  let isPolite = false; // the first joiner is polite

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
        socket.value?.emit('rtc-signal', { signal: { candidate: e.candidate }, to: peerId });
      }
    };

    pc.ontrack = (e) => {
      remoteStreams.value = { ...remoteStreams.value, [peerId]: e.streams[0] };
    };

    pc.onconnectionstatechange = () => {
      connectionState.value = { ...connectionState.value, [peerId]: pc.connectionState };
      if (pc.connectionState === 'failed') pc.restartIce?.();
    };

    pcMap.set(peerId, pc);

    if (isInitiator) {
      (async () => {
        try {
          makingOffer = true;
          const offer = await pc.createOffer();
          await pc.setLocalDescription(offer);
          socket.value?.emit('rtc-signal', { signal: { sdp: pc.localDescription }, to: peerId });
        } catch (err) {
          console.error('[WebRTC] createOffer failed', err);
        } finally {
          makingOffer = false;
        }
      })();
    }

    return pc;
  }

  async function handleRemoteSignal(from: string, signal: any) {
    let pc = pcMap.get(from);
    if (!pc) pc = createPeer(from, false);

    try {
      if (signal.sdp) {
        const desc = signal.sdp;
        const offerCollision = desc.type === 'offer' && (makingOffer || pc.signalingState !== 'stable');
        ignoreOffer = offerCollision && !isPolite;
        if (ignoreOffer) return;

        await pc.setRemoteDescription(desc);
        if (desc.type === 'offer') {
          const answer = await pc.createAnswer();
          await pc.setLocalDescription(answer);
          socket.value?.emit('rtc-signal', { signal: { sdp: pc.localDescription }, to: from });
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

  function handlePeerLeft(peerId: string) {
    const pc = pcMap.get(peerId);
    if (pc) { pc.close(); pcMap.delete(peerId); }
    const next = { ...remoteStreams.value }; delete next[peerId]; remoteStreams.value = next;
    const nc = { ...connectionState.value }; delete nc[peerId]; connectionState.value = nc;
  }

  // Wire socket listeners (SSE-based).
  function bind() {
    if (!socket.value) return;
    socket.value.on('rtc-signal', (data: any) => {
      if (data.room?.toUpperCase() === String(roomCode).toUpperCase()) {
        handleRemoteSignal(data.from, data.signal);
      }
    });
    socket.value.on('rtc-peer-left', (data: any) => handlePeerLeft(data.socketId));
    socket.value.on('participant-joined', (data: any) => {
      const existing = pcMap.get(data.participant.socketId);
      if (!existing && getLocalStream()) {
        // The later joiner initiates; if we are already here, we act as initiator.
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

  return { remoteStreams, connectionState, error, bind, createPeer, handleRemoteSignal, handlePeerLeft, destroy };
}

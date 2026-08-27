export type Participant = {
  socketId: string;
  name: string;
  language: string;
  targetLanguage: string;
  provider?: string;
};

type Room = {
  participants: Participant[];
};

const rooms = new Map<string, Room>();
const socketToRoom = new Map<string, string>();

export function generateRoomCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

export function createRoom(): string {
  let code = generateRoomCode();
  while (rooms.has(code)) {
    code = generateRoomCode();
  }
  rooms.set(code, { participants: [] });
  return code;
}

export function roomExists(code: string): boolean {
  return rooms.has(code.toUpperCase());
}

export function joinRoom(code: string, participant: Participant) {
  const upperCode = code.toUpperCase();
  if (!rooms.has(upperCode)) {
    rooms.set(upperCode, { participants: [] });
  }
  
  const room = rooms.get(upperCode)!;
  room.participants = room.participants.filter(p => p.socketId !== participant.socketId);
  room.participants.push(participant);
  
  socketToRoom.set(participant.socketId, upperCode);
}

export function leaveRoom(socketId: string): string | null {
  const roomCode = socketToRoom.get(socketId);
  if (roomCode) {
    const room = rooms.get(roomCode);
    if (room) {
      room.participants = room.participants.filter(p => p.socketId !== socketId);
      
      // Clean up empty room, OR if only bots are left
      const humanParticipants = room.participants.filter(p => !p.socketId.startsWith('bot-'));
      if (humanParticipants.length === 0) {
        rooms.delete(roomCode);
        // We could also delete bot socketIds from socketToRoom, but it's not crucial since bots don't really 'disconnect' normally, 
        // but just to be clean:
        room.participants.filter(p => p.socketId.startsWith('bot-')).forEach(b => socketToRoom.delete(b.socketId));
      }
    }
    socketToRoom.delete(socketId);
    return roomCode;
  }
  return null;
}

export function getRoomParticipants(code: string): Participant[] {
  return rooms.get(code.toUpperCase())?.participants || [];
}

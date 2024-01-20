import { io } from "socket.io-client";

const socket = io("http://localhost:8000");

socket.on("connect", () => console.log("Connected to socket.io server"));

export async function createRoom() {
  const response = await socket.emitWithAck("create");
  console.log(response);
  return response as string;
}

export async function joinRoom(roomId: string) {
  const response = await socket.emitWithAck("join", roomId);
  console.log(roomId, response);
  return response as boolean;
}

export function move(move: string) {
  socket.emit("move", move);
}

export function onGameStart(callback: (fen: string, isWhite: boolean) => void) {
  socket.on("start", (fen, whiteSocketId) =>
    callback(fen, socket.id === whiteSocketId)
  );
}

export function onUpdate(callback: (fen: string, lastMove: string) => void) {
  socket.on("update", callback);
}

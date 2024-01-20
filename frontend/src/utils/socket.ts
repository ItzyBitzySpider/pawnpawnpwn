import { io } from "socket.io-client";

const socket = window.location.hostname.includes("localhost")
  ? io("http://localhost:8080")
  : io(window.location.hostname, { path: "/api/socket.io/" });

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

export function resetRoom() {
  socket.emit("leave");
}

export async function move(move: string) {
  return (await socket.emitWithAck("move", move)) as string;
}

export function onGameStart(callback: (fen: string, isWhite: boolean) => void) {
  socket.on("start", (fen, whiteSocketId) => {
    console.log("Start", whiteSocketId);
    callback(fen, socket.id === whiteSocketId);
  });
}

export function onUpdate(
  callback: (fen: string, isTurn: boolean, lastMove: string) => void
) {
  socket.on("update", (fen, lastMovedUser, lastMove) => {
    console.log("Update", fen, lastMovedUser !== socket.id, lastMove);
    callback(fen, lastMovedUser !== socket.id, lastMove);
  });
}

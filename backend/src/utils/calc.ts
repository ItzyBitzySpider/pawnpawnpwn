import { Chess } from "chess.js";
import { Server } from "socket.io";

// Generate a random 6-letter room code
export function generateRoomCode() {
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  let roomCode = "";
  for (let i = 0; i < 6; i++) {
    roomCode += characters.charAt(
      Math.floor(Math.random() * characters.length)
    );
  }
  return roomCode;
}

export function processGameover(chess: Chess, io: Server, roomId: string) {
  if (chess.isGameOver()) io.to(roomId).emit("gameover", getWinner(chess));
}

function getWinner(chess: Chess) {
  if (chess.isCheckmate())
    return chess.turn() === "b" ? "White wins!" : "Black wins!";
  else return "Draw!";
}

import { io } from "socket.io-client";

const socket = io("http://localhost:8080");

socket.on("connect", () => {
  console.log(socket.id);
  socket.emit("create", (roomId) => {
    console.log(roomId);
  });

  socket.on("start", (fen, whiteSocketId) => {
    console.log(fen);

    if (whiteSocketId === socket.id) socket.emit("move", "aSTART");
    socket.on("update", (fen, lastMove) => {
      console.log(fen);
      const myTurn = lastMove !== socket.id;
      setTimeout(() => {
        if (myTurn) socket.emit("move", "a1");
      }, 2000);
    });
  });
});

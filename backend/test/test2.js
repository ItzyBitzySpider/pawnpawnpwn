import { io } from "socket.io-client";

const socket = io("http://localhost:8000");

socket.on("connect", () => {
  console.log(socket.id);
  socket.emit("join", "Z001OQ", (ack) => {
    console.log(ack);
  });

  socket.on("start", (fen, whiteSocketId) => {
    console.log(fen);

    if (whiteSocketId === socket.id) socket.emit("move", "bSTART");
    socket.on("update", (fen, lastMove) => {
      console.log(fen);
      const myTurn = lastMove !== socket.id;
      setTimeout(() => {
        if (myTurn) socket.emit("move", "b1");
      }, 2000);
    });
  });

  socket.send("ping");
});

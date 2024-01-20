import { io } from "socket.io-client";

const socket = io("http://localhost:8000");

socket.on("connect", () => {
  console.log(socket.id);
  socket.emit("create", (roomId) => {
    console.log(roomId);
  });

  socket.send("ping");
});

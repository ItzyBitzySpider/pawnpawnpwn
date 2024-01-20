import { io } from "socket.io-client";

const socket = io("http://localhost:8000");

socket.on("connect", () => {
  console.log(socket.id);
  socket.emit("join", "TEST", (ack) => {
    console.log(ack);
  });

  socket.send("ping");
});

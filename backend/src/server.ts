import { createServer } from "http";
import express from "express";
import morgan from "morgan";
import cors from "cors";
import { generateRoomCode } from "./utils/calc.js";
import "dotenv";
import { Server } from "socket.io";

const ENVIRONMENT = process.env.ENV || "dev";

let httpServer = createServer();
const io = new Server(httpServer, {
  serveClient: false,
  cors:
    ENVIRONMENT === "dev"
      ? { origin: "*", methods: ["GET", "POST"] }
      : undefined,
});

let expressApp = express();
if (ENVIRONMENT === "dev") {
  expressApp.use(morgan("dev"));
  expressApp.use(cors());
}

// Add GET /health-check express route
expressApp.get("/health-check", (req, res) => {
  res.status(200).send("OK");
});

io.on("connection", (socket) => {
  console.log(`${socket.id} connected`);

  socket.on("ping", (data, ack) => {
    const startTime = Date.now();
    ack({ data: "pong", timestamp: data.timestamp });
  });

  socket.on("create", (callback) => {
    const roomId = generateRoomCode();
    console.log(socket.id, "create:", roomId);
    socket.join(roomId);
    callback(roomId);
  });

  socket.on("join", (roomId, callback) => {
    console.log(socket.id, "join:", roomId);
    if (!io.sockets.adapter.rooms.has(roomId)) {
      callback(false);
      return;
    }
    socket.join(roomId);

    if (io.sockets.adapter.rooms.get(roomId).size === 2)
      io.to(roomId).emit(
        "start",
        "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR",
        socket.id
      );

    callback(true);
  });

  socket.on("move", (move) => {
    console.log(socket.id, move);
    socket.rooms.forEach((roomId) =>
      io.to(roomId).emit(
        "update",
        "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
        socket.id,
        null //TODO winner
      )
    );
  });

  socket.on("disconnecting", () => {
    console.log(`${socket.id} disconnecting`);
  });

  socket.on("disconnected", () => {
    console.log(`${socket.id} disconnected`);
  });
});

httpServer.listen(8000);

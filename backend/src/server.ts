import { createServer } from "http";
import express from "express";
import morgan from "morgan";
import cors from "cors";
import { generateRoomCode } from "./utils/calc.js";
import dotenv from "dotenv";
import { Server } from "socket.io";
import { Chess } from "chess.js";

dotenv.config();

const ENVIRONMENT = process.env.ENV || "dev";

const chess = new Chess();

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
      callback("denied");
      return;
    }
    socket.join(roomId);

    if (io.sockets.adapter.rooms.get(roomId).size === 2)
      io.to(roomId).emit(
        "start",
        "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR",
        socket.id
      );

    callback("answer");
  });

  socket.on("move", (move, callback) => {
    console.log(socket.id, move);
    const allowed = Math.random() < 0.7; //TODO LLM

    if (allowed) {
      //TODO execute parsed move from LLM
      const availableMoves = chess.moves();
      chess.move(
        availableMoves[Math.floor(Math.random() * availableMoves.length)]
      );
      socket.rooms.forEach((roomId) => {
        if (roomId !== socket.id)
          io.to(roomId).emit("update", chess.fen(), socket.id, move);
      });
      callback("Allowed " + move);
    } else callback("Denied");
  });

  socket.on("disconnecting", () => {
    console.log(`${socket.id} disconnecting`);
  });

  socket.on("disconnected", () => {
    console.log(`${socket.id} disconnected`);
  });
});

httpServer.listen(8000);

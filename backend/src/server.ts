import { createServer } from "http";
import express from "express";
import morgan from "morgan";
import cors from "cors";
import { generateRoomCode } from "./utils/calc.js";
import dotenv from "dotenv";
import { Server } from "socket.io";
import { Chess } from "chess.js";
import "./utils/globals.js";
import { FailedMove, interpretMove } from "./chess/engine.js";
import { assertUnreachable } from "./utils/assertions.js";

dotenv.config();

globalThis.roomFen = new Map();

const ENVIRONMENT = process.env.ENV || "dev";

const START_FEN = new Chess().fen();
const chess = new Chess();

let expressApp = express();
if (ENVIRONMENT === "dev") {
  expressApp.use(morgan("dev"));
  expressApp.use(cors());
}

let httpServer = createServer(expressApp);

const io = new Server(httpServer, {
  serveClient: false,
  cors:
    ENVIRONMENT === "dev"
      ? { origin: "*", methods: ["GET", "POST"] }
      : undefined,
});

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
    globalThis.roomFen.set(roomId, START_FEN);

    if (io.sockets.adapter.rooms.get(roomId).size === 2)
      io.to(roomId).emit("start", START_FEN, socket.id);

    callback("answer");
  });

  socket.on("leave", () => {
    socket.rooms.forEach((roomId) => {
      if (roomId !== socket.id) socket.leave(roomId);
    });
  });

  socket.on("move", async (move, callback) => {
    console.log(socket.id, move);
    const allowed = Math.random() < 0.7; //TODO LLM

    const roomIter = socket.rooms.values();
    let roomId = "";
    for (let room of roomIter) {
      if (room !== socket.id) {
        roomId = room;
        break;
      }
    }

    const res = await interpretMove(move, globalThis.roomFen.get(roomId));
    if (res instanceof FailedMove) {
      callback(res.error);
    } else if (typeof res === "string") {
      io.to(roomId).emit("update", res, socket.id, move);
      callback(res);
    } else {
      assertUnreachable(res);
    }

    // setTimeout(() => {
    //   if (allowed) {
    //     //TODO execute parsed move from LLM
    //     const availableMoves = chess.moves();
    //     chess.move(
    //       availableMoves[Math.floor(Math.random() * availableMoves.length)]
    //     );
    //     socket.rooms.forEach((roomId) => {
    //       if (roomId !== socket.id)
    //         io.to(roomId).emit("update", chess.fen(), socket.id, move);
    //     });
    //     callback("Allowed " + move);
    //   } else
    // }, 1000);
  });

  socket.on("disconnecting", () => {
    console.log(`${socket.id} disconnecting`);
  });

  socket.on("disconnected", () => {
    console.log(`${socket.id} disconnected`);
  });
});

httpServer.listen(8080);

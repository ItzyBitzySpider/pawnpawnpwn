import { createServer } from "http";
import express from "express";
import morgan from "morgan";
import cors from "cors";
import { generateRoomCode, processGameover, swapTurn } from "./utils/calc.js";
import dotenv from "dotenv";
import { Server } from "socket.io";
import { Chess } from "chess.js";
import "./utils/globals.js";
import { FailedMove, SuccessfulMove, interpretMove } from "./chess/engine.js";
import { assertUnreachable } from "./utils/assertions.js";
import stockfish from "stockfish";

dotenv.config();

globalThis.roomFen = new Map();

const ENVIRONMENT = process.env.ENV || "dev";

const START_FEN =
  "rnbqkbnr/ppppp2p/5p2/6p1/8/4P1P1/PPPP1P1P/RNBQKBNR w KQkq g6 0 3"; //new Chess().fen();

const engine = stockfish();
engine.onmessage = function (msg) {
  console.log(msg);
};
engine.postMessage("uci");

let expressApp = express();
expressApp.use(express.json());
expressApp.use(express.urlencoded({ extended: true }));
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

expressApp.post("/stockfish", async (req, res) => {
  console.log("QUERY", req.body.fen);
  // if chess engine replies
  engine.onmessage = function (msg) {
    console.log(msg);
    // in case the response has already been sent?
    if (res.headersSent) {
      return;
    }
    // only send response when it is a recommendation
    if (typeof (msg == "string") && msg.match("bestmove")) {
      res.send(msg.split(" ")[1]);
    }
  };

  // run chess engine
  engine.postMessage("ucinewgame");
  engine.postMessage("position fen " + req.body.fen);
  engine.postMessage("go depth 20");
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
    if (roomId !== "ai" && !io.sockets.adapter.rooms.has(roomId)) {
      callback(false);
      return;
    }
    socket.join(roomId);

    globalThis.roomFen.set(roomId === "ai" ? socket.id : roomId, START_FEN);

    if (roomId === "ai" || io.sockets.adapter.rooms.get(roomId).size === 2)
      io.to(roomId === "ai" ? socket.id : roomId).emit(
        "start",
        START_FEN,
        socket.id
      );

    callback(true);
  });

  socket.on("leave", () => {
    socket.rooms.forEach((roomId) => {
      if (roomId !== socket.id) socket.leave(roomId);
    });
  });

  socket.on("move", async (move, callback) => {
    console.log(socket.id, move);

    const roomIter = socket.rooms.values();
    let roomId = "";
    for (let room of roomIter) {
      if (room !== socket.id) {
        roomId = room;
        if (room === "ai") break;
      }
    }

    // const allowed = Math.random() < 0.7;
    // if (allowed) {
    //   const chess = new Chess(
    //     globalThis.roomFen.get(roomId === "ai" ? socket.id : roomId)
    //   );
    //   const availableMoves = chess.moves();
    //   chess.move(
    //     availableMoves[Math.floor(Math.random() * availableMoves.length)]
    //   );
    //   io.to(roomId === "ai" ? socket.id : roomId).emit(
    //     "update",
    //     chess.fen(),
    //     socket.id,
    //     move
    //   );
    //   globalThis.roomFen.set(roomId === "ai" ? socket.id : roomId, chess.fen());
    //   console.log(globalThis.roomFen);
    //   callback("Allowed " + move);
    // } else callback("Denied");

    const res = await interpretMove(
      move,
      globalThis.roomFen.get(roomId === "ai" ? socket.id : roomId)
    );
    if (res instanceof FailedMove) {
      callback(res.error);
    } else if (res instanceof SuccessfulMove) {
      res.fen = swapTurn(res.fen);
      io.to(roomId === "ai" ? socket.id : roomId).emit(
        "update",
        res.fen,
        socket.id,
        res.move.toString()
      );
      globalThis.roomFen.set(roomId === "ai" ? socket.id : roomId, res.fen);
      callback(res.move.toString());

      const gameover = processGameover(
        new Chess(res.fen),
        io,
        roomId === "ai" ? socket.id : roomId
      );

      if (!gameover && roomId === "ai") {
        fetch("http://localhost:8080/stockfish", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            fen: globalThis.roomFen.get(socket.id),
          }),
        }).then((response) =>
          response.text().then((res) => {
            const chess = new Chess(globalThis.roomFen.get(socket.id));
            console.log(globalThis.roomFen.get(socket.id));
            chess.move(res);
            io.to(socket.id).emit("update", chess.fen(), "ai", res);
            globalThis.roomFen.set(socket.id, chess.fen());

            processGameover(chess, io, socket.id);
          })
        );
      }
    } else {
      assertUnreachable(res);
    }
  });

  socket.on("disconnecting", () => {
    console.log(`${socket.id} disconnecting`);
  });

  socket.on("disconnected", () => {
    console.log(`${socket.id} disconnected`);
  });
});

httpServer.listen(8080);

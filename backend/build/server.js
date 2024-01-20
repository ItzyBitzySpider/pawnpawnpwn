import { createServer } from "http";
import express from "express";
import morgan from "morgan";
import cors from "cors";
import { generateRoomCode } from "./utils/calc.js";
import "dotenv";
import { Server } from "socket.io";
var ENVIRONMENT = process.env.ENV || "dev";
var httpServer = createServer();
var io = new Server(httpServer, { serveClient: false });
var expressApp = express();
if (ENVIRONMENT === "dev") {
    expressApp.use(morgan("dev"));
    expressApp.use(cors());
}
// Add GET /health-check express route
expressApp.get("/health-check", function (req, res) {
    res.status(200).send("OK");
});
io.on("connection", function (socket) {
    console.log("".concat(socket.id, " connected"));
    socket.on("ping", function (data, ack) {
        var startTime = Date.now();
        ack({ data: "pong", timestamp: data.timestamp });
    });
    socket.on("create", function (callback) {
        var roomId = generateRoomCode();
        console.log(socket.id, "create:", roomId);
        socket.join(roomId);
        callback(roomId);
    });
    socket.on("join", function (roomId, callback) {
        console.log(socket.id, "join:", roomId);
        if (!io.sockets.adapter.rooms.has(roomId)) {
            callback(false);
            return;
        }
        socket.join(roomId);
        if (io.sockets.adapter.rooms.get(roomId).size === 2)
            io.to(roomId).emit("start", "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR", socket.id);
        callback(true);
    });
    socket.on("move", function (move) {
        console.log(socket.id, move);
        socket.rooms.forEach(function (roomId) {
            return io
                .to(roomId)
                .emit("update", "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1", socket.id);
        });
    });
    socket.on("disconnecting", function () {
        console.log("".concat(socket.id, " disconnecting"));
    });
    socket.on("disconnected", function () {
        console.log("".concat(socket.id, " disconnected"));
    });
});
httpServer.listen(8000);

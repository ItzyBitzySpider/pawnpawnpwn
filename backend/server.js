import http from "http";
import eetase from "eetase";
import socketClusterServer from "socketcluster-server";
import express from "express";
import serveStatic from "serve-static";
import path from "path";
import morgan from "morgan";
import { fileURLToPath } from "url";
import { generateRoomCode } from "./utils/calc.js";
import { debugServerLogs } from "./utils/debug.js";
import "dotenv";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ENVIRONMENT = process.env.ENV || "dev";
const SOCKETCLUSTER_PORT = process.env.SOCKETCLUSTER_PORT || 8000;
const SOCKETCLUSTER_LOG_LEVEL = process.env.SOCKETCLUSTER_LOG_LEVEL || 2;

let agOptions = {};

if (process.env.SOCKETCLUSTER_OPTIONS) {
    let envOptions = JSON.parse(process.env.SOCKETCLUSTER_OPTIONS);
    Object.assign(agOptions, envOptions);
}

let httpServer = eetase(http.createServer());

let expressApp = express();
if (ENVIRONMENT === "dev") {
    expressApp.use(morgan("dev"));
}
expressApp.use(serveStatic(path.resolve(__dirname, "public")));

// Add GET /health-check express route
expressApp.get("/health-check", (req, res) => {
    res.status(200).send("OK");
});

// create-room express route
expressApp.get("/create-room", (req, res) => {
    const roomCode = generateRoomCode();
    console.log(roomCode);
    let agServer = socketClusterServer.attach(httpServer, {
        path: "/socketcluster/" + roomCode,
    });

    // SocketCluster/WebSocket connection handling loop.
    (async () => {
        for await (let { socket } of agServer.listener("connection")) {
            console.log(socket.id + " connected to room " + roomCode);
        }
    })();

    debugServerLogs(2, agServer);

    res.status(200).json({ roomCode });
});

// HTTP request handling loop.
(async () => {
    for await (let requestData of httpServer.listener("request")) {
        expressApp.apply(null, requestData);
    }
})();

httpServer.listen(SOCKETCLUSTER_PORT);

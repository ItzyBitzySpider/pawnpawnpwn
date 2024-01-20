import socketClusterClient from "socketcluster-client";

// Make an HTTP request to localhost/create-room
const response = await fetch("http://localhost:8000/create-room");
const data = await response.json();

// Parse the JSON response to get the roomCode
const roomCode = data.roomCode;
console.log("Room Code:", roomCode);

// Initiate the connection to the server
let socket = socketClusterClient.create({
    hostname: "localhost",
    port: "8000",
    path: "/socketcluster/" + roomCode,
});

(async () => {
    for await (let { error } of socket.listener("error")) {
        console.error(error);
    }
})();

(async () => {
    for await (let event of socket.listener("connect")) {
        console.log("Socket is connected");
    }
})();

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateRoomCode = void 0;
// Generate a random 6-letter room code
function generateRoomCode() {
    var characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    var roomCode = "";
    for (var i = 0; i < 6; i++) {
        roomCode += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return roomCode;
}
exports.generateRoomCode = generateRoomCode;

// Generate a random 6-letter room code
export function generateRoomCode() {
    var characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    var roomCode = "";
    for (var i = 0; i < 6; i++) {
        roomCode += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return roomCode;
}

// Generate a random 6-letter room code
export function generateRoomCode() {
    const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    let roomCode = "";
    for (let i = 0; i < 6; i++) {
        roomCode += characters.charAt(
            Math.floor(Math.random() * characters.length)
        );
    }
    return roomCode;
}

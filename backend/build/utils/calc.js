// Generate a random 6-letter room code
export function generateRoomCode() {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
}

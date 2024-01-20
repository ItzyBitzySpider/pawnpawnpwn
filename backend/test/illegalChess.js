import { Chess, validateFen } from "chess.js";

const FEN = "rnbqkb1r/1p2ppp1/3p4/p2n3p/3P4/3B1N2/PPP2PPP/RNBQK2R w KQkq - 0 7";
const chess = new Chess(FEN);

function move(square1, square2) {
    const piece = chess.remove(square1);
    if (!piece) {
        console.log(piece)
        return null;
    }
    chess.put(piece, square2);
    if (!validateFen(chess.fen()).ok) {
        console.log(validateFen(chess.fen()));
        // return null;
    }
    return chess.fen();
}

function promote(square1, square2, piece) {
    const pawn = chess.remove(square1);
    if (!pawn) {
        console.log(pawn)
        return null;
    }
    chess.put({ type: piece, color: pawn.color }, square2);
    if (!validateFen(chess.fen()).ok) {
        console.log(validateFen(chess.fen()));
        // return null;
    }
    return chess.fen();
}

console.log(move("e2", "e4"));
console.log(promote("g7", "g8", "q"));

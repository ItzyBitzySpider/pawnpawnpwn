import { Chess, validateFen } from "chess.js";
import { llmInterpretPrompt } from "./llm";
import { assertUnreachable } from "../utils/assertions";


class NormalMove {
    square1: string;
    square2: string;
    constructor(square1: string, square2: string) {
        this.square1 = square1;
        this.square2 = square2;
    }
}

class PromotionMove extends NormalMove {
    piece: "q" | "r" | "b" | "n";
    constructor(square1: string, square2: string, piece: "q" | "r" | "b" | "n") {
        super(square1, square2)
        this.piece = piece;
    }
}

class InvalidMove {
    prompt: string;
    constructor(prompt: string) {
        this.prompt = prompt;
    }
}

class FailedMove {
    error: string;
    constructor(error: string) {
        this.error = error;
    }

}

type Move = InvalidMove | NormalMove | PromotionMove;

const FEN = "rnbqkb1r/1p2ppp1/3p4/p2n3p/3P4/3B1N2/PPP2PPP/RNBQK2R w KQkq - 0 7";
const chess = new Chess(FEN);

function movePiece(square1, square2): string | FailedMove {
    const piece = chess.remove(square1);
    if (!piece) {
        console.log(piece)
        return null;
    }
    chess.put(piece, square2);
    const validate = validateFen(chess.fen());
    if (validate.ok) {
        return chess.fen();
    }else {
        console.log(validateFen(chess.fen()));
        return new FailedMove(validate.error);
    }
}

function promotePiece(square1, square2, piece): string | FailedMove {
    const pawn = chess.remove(square1);
    if (!pawn) {
        console.log(pawn)
        return null;
    }
    chess.put({ type: piece, color: pawn.color }, square2);
    const validate = validateFen(chess.fen());
    if (validate.ok) {
        return chess.fen();
    } else {
        console.log(validateFen(chess.fen()));
        return new FailedMove(validate.error);
    }
}

export async function interpretMove(prompt: string, fen: string): Promise<string | FailedMove> {
    const move = await llmInterpretPrompt(prompt, fen);
    if (move instanceof NormalMove) {
        return movePiece(move.square1, move.square2);
    } else if (move instanceof PromotionMove) {
        return promotePiece(move.square1, move.square2, move.piece);
    } else if (move instanceof InvalidMove) {
        assertUnreachable(move);
    }
}


export {Move, NormalMove, PromotionMove, InvalidMove}
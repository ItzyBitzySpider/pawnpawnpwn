import { Chess, Square, validateFen } from "chess.js";
import { llmInterpretPrompt } from "./llm.js";
import { assertUnreachable } from "../utils/assertions.js";

class NormalMove {
  square1: Square;
  square2: Square;
  constructor(square1: Square, square2: Square) {
    this.square1 = square1;
    this.square2 = square2;
  }

  format(): string {
    return `(${this.square1}, ${this.square2})`;
  }

  toString(): string {
    return `Move piece from ${this.square1} to ${this.square2}`;
  }
}

class PromotionMove extends NormalMove {
  piece: "q" | "r" | "b" | "n";
  pieceMap  = {
    q: "queen",
    r: "rook",
    b: "bishop",
    n: "knight",
  }
  constructor(square1: Square, square2: Square, piece: "q" | "r" | "b" | "n") {
    super(square1, square2);
    this.piece = piece;
  }

  format(): string {
    return `(${this.square1}, ${this.square2}, '${this.piece}')`;
  }

  toString(): string {
    return `Move piece from ${this.square1} to ${this.square2} and promote to a ${this.pieceMap[this.piece]}`;
  }
  
}

class InvalidMove {
  prompt: string;
  constructor(prompt: string) {
    this.prompt = prompt;
  }
  
  toString() : string {
    return 'Invalid Move'
  }
}

class FailedMove {
  error: string;
  constructor(error: string) {
    this.error = error;
  }
}

class SuccessfulMove {
  fen: string;
  move: NormalMove | PromotionMove;
  constructor(fen: string, move: NormalMove | PromotionMove) {
    this.fen = fen;
    this.move = move; 
  }
}

type Move = InvalidMove | NormalMove | PromotionMove;
// const FEN = "rnbqkb1r/1p2ppp1/3p4/p2n3p/3P4/3B1N2/PPP2PPP/RNBQK2R w KQkq - 0 7";


function movePiece(move: NormalMove, fen: string): SuccessfulMove | FailedMove {
  const chess = new Chess(fen);
  const { square1, square2 } = move;
  const piece = chess.remove(square1);
  if (!piece) {
    return new FailedMove(`Tried to move piece at ${square1} to ${square2} but there was no piece found at ${square1}`);
  }
  chess.put(piece, square2);
  const validate = validateFen(chess.fen());
  if (validate.ok) {
    return new SuccessfulMove(chess.fen(), move);
  } else {
    console.log(validateFen(chess.fen()));
    return new FailedMove(validate.error);
  }
}

function promotePiece(move: PromotionMove, fen: string): SuccessfulMove | FailedMove {
  const chess = new Chess(fen);
  const { square1, square2, piece } = move;
  const pawn = chess.remove(square1);
  if (!pawn) {
    return new FailedMove(`Tried to promote piece at ${square1}, but there was no piece found at ${square1}`);
  }
  chess.put({ type: piece, color: pawn.color }, square2);
  const validate = validateFen(chess.fen());
  if (validate.ok) {
    return new SuccessfulMove(chess.fen(), move);
  } else {
    console.log(validateFen(chess.fen()));
    return new FailedMove(validate.error);
  }
}

export async function interpretMove(
  prompt: string,
  fen: string
): Promise<SuccessfulMove | FailedMove> {
  const move = await llmInterpretPrompt(prompt, fen);
  if (move instanceof NormalMove) {
    console.log('return normal move')
    return movePiece(move, fen);
  } else if (move instanceof PromotionMove) {
    console.log('return promotion move')
    return promotePiece(move, fen);
  } else if (move instanceof InvalidMove) {
    console.log('return failed move')
    return new FailedMove(move.prompt);
  } else {
    console.log('return unreachable')
    assertUnreachable(move);
  }
}

export { Move, NormalMove, PromotionMove, InvalidMove, FailedMove, SuccessfulMove };

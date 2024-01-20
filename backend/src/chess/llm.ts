import { BlockReason, GoogleGenerativeAI } from "@google/generative-ai";
import { Piece } from "chess.js";
import { assertUnreachable, assertNever } from "../utils/assertions.js";
import dotenv from "dotenv";
import { InvalidMove, Move, NormalMove, PromotionMove } from "./engine.js";
dotenv.config();

async function displayTokenCount(model, request) {
  const { totalTokens } = await model.countTokens(request);
  console.log("Token count: ", totalTokens);
}

async function displayChatTokenCount(model, chat, msg) {
  const history = await chat.getHistory();
  const msgContent = { role: "user", parts: [{ text: msg }] };
  await displayTokenCount(model, { contents: [...history, msgContent] });
}

// Access your API key as an environment variable (see "Set up your API key" above)
const genAI = new GoogleGenerativeAI(process.env.GEMINI_KEY);
const FEN = "rnbqkb1r/1p2ppp1/3p4/p2n3p/3P4/3B1N2/PPP2PPP/RNBQK2R w KQkq - 0 7";

export async function llmInterpretPrompt(
  prompt: string,
  fen: string
): Promise<Move> {
  // For text-only input, use the gemini-pro model
  const model = genAI.getGenerativeModel({ model: "gemini-pro" });
  const chat = model.startChat({
    history: [
      {
        role: "user",
        parts: `Assume the role of an Next Generation Chess Interpreter. Players will describe their moves within 15 words and you are to parse them into valid chess moves. Your response can be one of the following:

            1. (square, square), to move a piece from the first square to the second square. For example, ('e2', 'e4')
            2. (square, square, piece), to promote a pawn to a piece. For example, ('e7', 'e8', 'q'). This promotes the pawn at e7 to a queen. The piece can be a 'q' (queen), 'r' (rook), 'b' (bishop), or 'n' (knight).
            3. 'Invalid move', if the move does not make sense or is illegal.
            If you understand, respond with 'Yes, I understand'. The current game state is provided by the following FEN: ${fen}`,
      },
      {
        role: "model",
        parts: "Yes, I understand.",
      },
    ],
    generationConfig: {
      maxOutputTokens: 1000,
    },
  });

  const result = await chat.sendMessage(prompt);
  const response = await result.response;

  if (
    response.promptFeedback &&
    response.promptFeedback.blockReason !==
      BlockReason.BLOCKED_REASON_UNSPECIFIED
  ) {
    return new InvalidMove(
      "Blocked Prompt: " + response.promptFeedback.blockReasonMessage
    );
  }

  const text = response.text();
  const safe = await llmCheckMoveValidity(text, fen);
  console.log(parseResponseMove(text), safe);
  if (safe) {
    return parseResponseMove(text);
  } else {
    return new InvalidMove("Illegal Move: " + text);
  }
}

async function llmCheckMoveValidity(
  prompt: string,
  fen: string
): Promise<boolean> {
  // For text-only input, use the gemini-pro model
  const model = genAI.getGenerativeModel({ model: "gemini-pro" });
  const chat = model.startChat({
    history: [
      {
        role: "user",
        parts: `Assume the role of an Next Generation Chess Interpreter. Given the FEN of the current game, you are to determine whether a move is legal. The input can be one of the following formats:

            1. (square, square), to move a piece from the first square to the second square. For example, ('e2', 'e4') moves the piece at e2 to e4.
            2. (square, square, piece), to promote a pawn to a piece. For example, ('e7', 'e8', 'q'), promotes the pawn at e7 to a queen. The piece can be a 'q' (queen), 'r' (rook), 'b' (bishop), or 'n' (knight).

            If the move is legal, respond with 'True'. If the move is illegal, respond with 'False'. You should only have either 'True' or 'False' in your response.
            If you understand, respond with 'Yes, I understand'. The current game state is provided by the following FEN: ${fen}`,
      },
      {
        role: "model",
        parts: "Yes, I understand.",
      },
    ],
    generationConfig: {
      maxOutputTokens: 100,
    },
  });

  const result = await chat.sendMessage(prompt);
  const response = await result.response;

  if (
    response.promptFeedback &&
    response.promptFeedback.blockReason !==
      BlockReason.BLOCKED_REASON_UNSPECIFIED
  ) {
    return false;
  }

  const text = response.text();
  return text === "True";
}

function parseResponseMove(response: string): Move {
  // if response contains 'Invalid move', return 'Invalid move'
  if (response.includes("Invalid move")) {
    return new InvalidMove(response);
  }

  // check if response is in the format (square, square)
  const moveRegex = /\(\'([abcdefgh]\d)\', \'([abcdefgh]\d)\'\)/;
  const moveMatch = response.match(moveRegex);
  if (moveMatch) {
    const [_, square1, square2] = moveMatch;
    return new NormalMove(square1, square2);
  }

  // check if response is in the format (square, square)
  const promotionRegex =
    /\(\'([abcdefgh]\d)\', \'([abcdefgh])\d\', '([qrbn])'\)/;
  const promotionMatch = response.match(promotionRegex);
  if (promotionMatch) {
    const [_, square1, square2, piece] = promotionMatch;
    if (piece === "q" || piece === "r" || piece === "b" || piece === "n") {
      return new PromotionMove(square1, square2, piece);
    } else {
      assertNever();
    }
  }

  return new InvalidMove(`Illegal Move: \n ${response}`);
}

import {
    BlockReason,
    FinishReason,
    GenerativeModel,
    GoogleGenerativeAI,
} from "@google/generative-ai";
import { assertNever, assertUnreachable } from "../utils/assertions.js";
import dotenv from "dotenv";
import { InvalidMove, Move, NormalMove, PromotionMove } from "./engine.js";
dotenv.config();

async function getTokenCount(
    model: GenerativeModel,
    request: string
): Promise<number> {
    const { totalTokens } = await model.countTokens(request);
    console.log("Token count: ", totalTokens);
    return totalTokens;
}

// Access your API key as an environment variable (see "Set up your API key" above)
const genAI = new GoogleGenerativeAI(process.env.GEMINI_KEY);

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
                parts: `Assume the role of an Next Generation Chess Interpreter. Players will describe their moves and you are to parse them into valid chess moves. 
                
        The current game state is provided by the following FEN: ${fen}
        
        Your response must be one of the following:

    1. (<square>, <square>), to move a piece from the first square to the second square. For example, ('e2', 'e4')
    2. (<square>, <square>, <piece>), to promote a pawn to a piece. For example, ('e7', 'e8', 'q'). This promotes the pawn at e7 to a queen. The piece can be a 'q' (queen), 'r' (rook), 'b' (bishop), or 'n' (knight).

    This is very important: You should only have either a move formatted as (<square>, <square>) or (<square>, <square>, <piece>) in your response. 

    If you understand, respond with 'Yes, I understand'.`,
            },
            {
                role: "model",
                parts: "Yes, I understand.",
            },
        ],
        generationConfig: {
            maxOutputTokens: 500,
        },
    });
    
    if ((await getTokenCount(model, prompt)) > 1000) {
        return new InvalidMove(
            "Blocked Prompt: The prompt was too long. Please try again."
        );
    }
    const result = await chat.sendMessage(prompt);
    const response = await result.response;

    if (response.candidates[0].finishReason === FinishReason.MAX_TOKENS) {
        return new InvalidMove(
            "Blocked Prompt: The response returned was too long. Please try again."
        );
    } else if (response.candidates[0].finishReason === FinishReason.SAFETY) {
        return new InvalidMove(
            "Blocked Prompt: The prompt was flagged as harmful. Please try again."
        );
    }

    const text = response.text();
    const parsed = parseResponseMove(text);
    if (parsed instanceof InvalidMove) {
        return parsed;
    } else if (
        parsed instanceof PromotionMove ||
        parsed instanceof NormalMove
    ) {
        const safe = await llmCheckMoveValidity(parsed, fen);
        if (safe) {
            return parsed;
        } else {
            return new InvalidMove(`Illegal Move: ${text}`);
        }
    } else {
        assertUnreachable(parsed);
    }
}

async function llmCheckMoveValidity(
    prompt: NormalMove | PromotionMove,
    fen: string
): Promise<boolean> {
    // For text-only input, use the gemini-pro model
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    const chat = model.startChat({
        history: [
            {
                role: "user",
                parts: `Assume the role of an Next Generation Chess Interpreter. Using the FEN and next move you are to determine whether the next move is legal. The move can be one of the following formats:

                1. (<square>, <square>), to move a piece from the first square to the second square. For example, (e2, e4) moves the piece at e2 to e4.
                2. (<square>, <square>, <piece>), to promote a pawn to a piece. For example, (e7, e8, q), promotes the pawn at e7 to a queen. The piece can be a 'q' (queen), 'r' (rook), 'b' (bishop), or 'n' (knight).
    
                If the move is legal, respond with 'True'. If the move is illegal, respond with 'False'. You should only have either 'True' or 'False' in your response. 
                If you understand, respond with 'Yes, I understand'.`,
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

    const result = await chat.sendMessage(
        `The current game state is provided by the following FEN: ${fen}. The move to be made is ${prompt.toString()}`
    );

    const response = await result.response;
    if (response.candidates[0].finishReason === FinishReason.MAX_TOKENS) {
        return false;
    } else if (response.candidates[0].finishReason === FinishReason.SAFETY) {
        return false;
    }

    const text = response.text();
    return text === "True";
}

function parseResponseMove(response: string): Move {
    // check if response is in the format (square, square)
    const moveRegex = /\(\'?([abcdefgh]\d)\'?,\s?\'?([abcdefgh]\d)\'?\)/;
    const moveMatch = response.match(moveRegex);
    if (moveMatch) {
        const [_, square1, square2] = moveMatch;
        return new NormalMove(square1, square2);
    }

    // check if response is in the format (square, square)
    const promotionRegex =
        /\('?([abcdefgh]\d)'?,\s?'?([abcdefgh]\d)'?,\s?'?([qrbn])'?\)/;
    const promotionMatch = response.match(promotionRegex);
    if (promotionMatch) {
        const [_, square1, square2, piece] = promotionMatch;
        if (piece === "q" || piece === "r" || piece === "b" || piece === "n") {
            return new PromotionMove(square1, square2, piece);
        } else {
            assertNever();
        }
    }
    return new InvalidMove(`Invalid Response: ${response}`);
}

import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from  'dotenv';
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

console.log(process.env.GEMINI_KEY)
// Access your API key as an environment variable (see "Set up your API key" above)
const genAI = new GoogleGenerativeAI(process.env.GEMINI_KEY);

async function run() {
    // For text-only input, use the gemini-pro model
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    const FEN = "rnbqkb1r/1p2ppp1/3p4/p2n3p/3P4/3B1N2/PPP2PPP/RNBQK2R w KQkq - 0 7";
    const chat = model.startChat({
        history: [
          {
            role: "user",
            parts: `Assume the role of a Advanced Chess Interpreter. You will be given moves which are you are to interpret respond with a valid chess move. If you determine that the move is not possible, respond with 'Invalid'. If you understand, respond with 'Yes, I understand'. The current game state is provided by the following FEN: ${FEN}`,
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

    // const prompt = 
    const prompt = "advance the queen forward to make a check";

    // const result = await model.generateContent(prompt);
    const result = await chat.sendMessage(prompt)
    const response = await result.response;
    const text = response.text();
    console.log(text);
}

run();

import { useState } from "react";
import "./App.css";
import Landing from "./Landing";
import Game from "./Game";
import { onGameStart, onUpdate } from "./utils/socket";

function App() {
  const [roomCode, setRoomCode] = useState<string | undefined>("");
  const [gameStarted, setGameStarted] = useState(false);
  const [fen, setFen] = useState<string | undefined>();
  const [isTurn, setIsTurn] = useState(false);
  const [isWhite, setIsWhite] = useState(false);

  onGameStart((fen, isWhite) => {
    setFen(fen);
    setIsWhite(isWhite);
    setIsTurn(isWhite);
    setGameStarted(true);
  });
  onUpdate((fen, isTurn, lastMove) => {
    setFen(fen);
    setIsTurn(isTurn);
  });

  return (
    <>
      {gameStarted ? (
        <Game fen={fen} isWhite={isWhite} isTurn={isTurn} />
      ) : (
        <Landing confirmedRoomCodeState={[roomCode, setRoomCode]} />
      )}
    </>
  );
}

export default App;

import { useState } from "react";
import "./App.css";
import Landing from "./Landing";
import Game from "./Game";

function App() {
  const [roomCode, setRoomCode] = useState<string | undefined>("");

  //TODO socket IO
  const [gameStarted, setGameStarted] = useState(true);

  return (
    <>
      {gameStarted ? (
        <Game />
      ) : (
        <Landing confirmedRoomCodeState={[roomCode, setRoomCode]} />
      )}
    </>
  );
}

export default App;

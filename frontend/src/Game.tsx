import { Button, Container, Grid, Icon, Input } from "semantic-ui-react";
import { useEffect, useState } from "react";
import { Chessboard } from "react-chessboard";
import "./Game.css";
import { Message } from "./types/message";

export default function Game() {
  const [fen, setFen] = useState(
    "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1"
  );

  useEffect(() => {
    setInterval(() => {
      const a = Date.now() % 3;

      if (a == 0)
        setFen("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1");
      else if (a == 1)
        setFen("rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq e3 0 1");
      else
        setFen(
          "rnbqkbnr/pp1ppppp/8/2p5/4P3/5N2/PPPP1PPP/RNBQKB1R b KQkq - 1 2"
        );
    }, 2813);
  }, []);

  const messages: Message[] = [
    { outgoing: true, text: "Knight to E5" },
    { outgoing: false, text: "Moving knight from A5 to E5" },
    {
      outgoing: true,
      text: "Knight to E5 and move all pawns forward. This is a very illegal move",
    },
    { outgoing: false, text: "Move not allowed! Try again!" },
    {
      outgoing: true,
      text: "Knight to E5 and move all pawns forward. This move is legal",
    },
    { outgoing: false, text: "Moving knight to E5 and move all pawns forward" },
    { outgoing: true, text: "Win the game" },
    { outgoing: false, text: "Move not allowed! Try again!" },
  ];

  return (
    <Grid columns={2} style={{ height: "80vh", width: "80vw" }}>
      <Grid.Column>
        <Chessboard position={fen} />
      </Grid.Column>
      <Grid.Column>
        <div>
          <Container className="chat">
            <Container
              style={{
                flex: 1,
                padding: 10,
                display: "flex",
                flexDirection: "column",
              }}
            >
              <Container style={{ flex: 1 }} />
              {messages.map((m) => (
                <div
                  className={
                    "message " + (m.outgoing ? "outgoing" : "incoming")
                  }
                >
                  <div>{m.text}</div>
                </div>
              ))}
            </Container>
            <Input
              action={
                <Button primary>
                  <Icon name="send" />
                </Button>
              }
            />
          </Container>
        </div>
      </Grid.Column>
    </Grid>
  );
}

import { Button, Container, Grid, Icon, Input } from "semantic-ui-react";
import { Chessboard } from "react-chessboard";
import "./Game.css";
import { Message } from "./types/message";
import { useCallback, useEffect, useRef, useState } from "react";
import { move, onGameover, onUpdate } from "./utils/socket";

export default function Game({
  fen,
  isWhite,
  isTurn,
}: {
  fen?: string;
  isWhite: boolean;
  isTurn: boolean;
}) {
  const bottomChat = useRef<HTMLDivElement>(null);
  const [text, setText] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setLoading] = useState(false);
  const [gameover, setGameover] = useState(false);

  // const messages: Message[] = [
  //   { outgoing: true, text: "Knight to E5" },
  //   { outgoing: false, text: "Moving knight from A5 to E5" },
  //   {
  //     outgoing: true,
  //     text: "Knight to E5 and move all pawns forward. This is a very illegal move",
  //   },
  //   { outgoing: false, text: "Move not allowed! Try again!" },
  //   {
  //     outgoing: true,
  //     text: "Knight to E5 and move all pawns forward. This move is legal",
  //   },
  //   { outgoing: false, text: "Moving knight to E5 and move all pawns forward" },
  //   { outgoing: true, text: "Win the game" },
  //   { outgoing: false, text: "Move not allowed! Try again!" },
  // ];

  useEffect(() => {
    onUpdate((_, isTurn, lastMove) => {
      if (isTurn)
        setMessages((msgs) =>
          msgs.concat(
            { outgoing: false, text: lastMove },
            { outgoing: false, text: "Your turn!" }
          )
        );
    });
    onGameover((text) => {
      setMessages((msgs) => msgs.concat({ outgoing: false, text }));
      setGameover(true);
    });
  }, []);

  const sendMessage = useCallback(() => {
    if (text.trim().length === 0) return;
    setMessages((msgs) => msgs.concat({ outgoing: true, text }));
    setLoading(true);
    move(text).then((res) => {
      setLoading(false);
      setMessages((msgs) => msgs.concat({ outgoing: false, text: res }));
    });
    setText("");
  }, [text]);

  useEffect(
    () => bottomChat.current?.scrollIntoView({ behavior: "smooth" }),
    [messages]
  );

  return (
    <Grid columns={2} style={{ height: "80vh", width: "80vw" }}>
      <Grid.Column>
        <Chessboard
          position={fen}
          areArrowsAllowed={false}
          arePiecesDraggable={false}
          boardOrientation={isWhite ? "white" : "black"}
          customLightSquareStyle={{ backgroundColor: "#CCC5B9" }}
          customDarkSquareStyle={{ backgroundColor: "#4C4843" }}
        />
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
              {messages.map((m, idx) => (
                <div
                  key={idx}
                  className={
                    "message " + (m.outgoing ? "outgoing" : "incoming")
                  }
                >
                  <div>{m.text}</div>
                </div>
              ))}
              <div ref={bottomChat}></div>
            </Container>
            <Input
              onKeyDown={(event: KeyboardEvent) => {
                if (event.key === "Enter") sendMessage();
              }}
              value={text}
              onChange={(t) => setText(t.target.value)}
              action={
                <Button
                  primary
                  onClick={sendMessage}
                  style={{ padding: "0.78571429em 1em 0.78571429em" }}
                >
                  <Icon name="send" style={{ marginRight: 0 }} />
                </Button>
              }
              placeholder={
                isLoading
                  ? "Processing..."
                  : isTurn
                  ? "Enter move"
                  : "Waiting for opponent..."
              }
              disabled={!isTurn || isLoading || gameover}
            />
          </Container>
        </div>
      </Grid.Column>
    </Grid>
  );
}

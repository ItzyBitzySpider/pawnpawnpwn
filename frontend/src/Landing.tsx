import { useCallback, useEffect, useRef, useState } from "react";
import { Button, Grid, Header, Icon, Input } from "semantic-ui-react";
import { createRoom, joinRoom, resetRoom } from "./utils/socket";
import imgUrl from "./assets/logo.svg";

export default function Landing({
  confirmedRoomCodeState,
}: {
  confirmedRoomCodeState: ReturnType<typeof useState<string>>;
}) {
  const [isChoosingState, setIsChoosingState] = useState(false);

  const roomCodeRef = useRef<Input>(null);
  const [roomCode, setRoomCode] = useState("");

  const [confirmedRoomCode, setConfirmedRoomCode] = confirmedRoomCodeState;

  useEffect(() => {
    if (isChoosingState) roomCodeRef.current?.focus();
  }, [isChoosingState]);

  const requestJoin = useCallback(async () => {
    if (roomCode.length == 6) {
      const joined = await joinRoom(roomCode);
      if (joined) {
        setIsChoosingState(false);
        setConfirmedRoomCode(roomCode);
      }
    }
  }, [roomCode, setConfirmedRoomCode]);

  return (
    <Grid columns={1} textAlign="center">
      <Grid.Row>
        <Header size="huge">
          <img src={imgUrl} style={{ width: "300px" }}></img>
        </Header>
      </Grid.Row>
      {confirmedRoomCode ? (
        <>
          <Grid.Row>
            <Grid.Column>
              <Header
                size="tiny"
                style={{ margin: 0, fontWeight: "bold", color: "#CCCCCC" }}
              >
                Room Code
              </Header>
              <Header size="medium" style={{ margin: 0 }}>
                {confirmedRoomCode}
              </Header>
            </Grid.Column>
          </Grid.Row>
          <Grid.Row>
            <Button
              secondary
              onClick={() => {
                setConfirmedRoomCode("");
                setRoomCode("");
                resetRoom();
              }}
            >
              Back
            </Button>
          </Grid.Row>
        </>
      ) : (
        <>
          <Grid.Row style={{ padding: "0.5rem" }}>
            <Button
              secondary
              onClick={() => {
                setConfirmedRoomCode("ai");
                joinRoom("ai");
              }}
            >
              Play Stockfish
            </Button>
          </Grid.Row>
          <Grid.Row style={{ padding: "0.5rem" }}>
            <Button
              secondary
              onClick={async () => {
                setConfirmedRoomCode(await createRoom());
              }}
            >
              Create Game
            </Button>
          </Grid.Row>
          <Grid.Row style={{ padding: "0.5rem" }}>
            {isChoosingState ? (
              <Input
                maxLength="6"
                ref={roomCodeRef}
                input={<input onBlur={() => setIsChoosingState(false)}></input>}
                placeholder="Enter Room Code"
                onKeyDown={(event: KeyboardEvent) => {
                  if (event.key === "Enter") requestJoin();
                }}
                action={
                  <Button secondary onMouseDown={requestJoin}>
                    <Icon name="sign-in" />
                  </Button>
                }
                onChange={(ev) => {
                  ev.target.value = ev.target.value.toUpperCase();
                  if (/^[A-Z]*$/.test(ev.target.value)) {
                    setRoomCode(ev.target.value);
                  } else {
                    ev.target.value = roomCode;
                  }
                }}
              ></Input>
            ) : (
              <Button onClick={() => setIsChoosingState(true)} secondary>
                Join Game
              </Button>
            )}
          </Grid.Row>
        </>
      )}
    </Grid>
  );
}

import { useCallback, useEffect, useRef, useState } from "react";
import { Button, Grid, Header, Icon, Input } from "semantic-ui-react";
import { createRoom, joinRoom, resetRoom } from "./utils/socket";

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
        <Header size="huge">Pawn Pawn Pwn</Header>
      </Grid.Row>
      {confirmedRoomCode ? (
        <>
          <Grid.Row>
            <Header>
              Waiting for opponent...
              <br />
              Room Code: {confirmedRoomCode}
            </Header>
          </Grid.Row>
          <Grid.Row>
            <Button
              primary
              onClick={() => {
                setConfirmedRoomCode("");
                setRoomCode("");
                resetRoom();
              }}
            >
              Back to Home
            </Button>
          </Grid.Row>
        </>
      ) : (
        <>
          <Grid.Row>
            <Button
              primary
              onClick={() => {
                setConfirmedRoomCode("ai");
                joinRoom("ai");
              }}
            >
              Play Stockfish
            </Button>
          </Grid.Row>
          <Grid.Row>
            <Button
              primary
              onClick={async () => {
                setConfirmedRoomCode(await createRoom());
              }}
            >
              Create Multiplayer Game
            </Button>
          </Grid.Row>
          <Grid.Row>
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
                  <Button primary onMouseDown={requestJoin}>
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
              <Button onClick={() => setIsChoosingState(true)} primary>
                Join Multiplayer Game
              </Button>
            )}
          </Grid.Row>
        </>
      )}
    </Grid>
  );
}

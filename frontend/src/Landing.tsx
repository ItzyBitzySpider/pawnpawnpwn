import { useEffect, useRef, useState } from "react";
import { Button, Grid, Header, Icon, Input } from "semantic-ui-react";

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
                //TODO: Socket IO
                setConfirmedRoomCode("ABCDEF");
              }}
            >
              Create Game
            </Button>
          </Grid.Row>
          <Grid.Row>
            {isChoosingState ? (
              <Input
                maxLength="6"
                ref={roomCodeRef}
                input={<input onBlur={() => setIsChoosingState(false)}></input>}
                placeholder="Enter Room Code"
                action={
                  <Button
                    primary
                    onMouseDown={() => {
                      //TODO: Socket IO
                      if (roomCode.length == 6) {
                        setIsChoosingState(false);
                        setConfirmedRoomCode(roomCode);
                      }
                    }}
                  >
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
                Join Game
              </Button>
            )}
          </Grid.Row>
        </>
      )}
    </Grid>
  );
}

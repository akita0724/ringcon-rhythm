"use client";

import { connectedAtom } from "@/lib/atom";
import { useRegistration } from "@/lib/hooks/registration";
import { useStepper } from "@/lib/hooks/stepper";
import { igniteJoyCon } from "@/lib/rincon";
import { Container, Typography, Button, Stack, Paper } from "@mui/material";
import { useSetAtom } from "jotai";

export default function Connector() {
  const { handleNext } = useStepper();
  const setConnected = useSetAtom(connectedAtom);
  const { PlayerRegistrationForm, isRegistered } = useRegistration();

  async function clickHandler() {
    const isConnected = await igniteJoyCon();
    console.log(isConnected);
    if (isConnected) {
      setConnected(true);
      handleNext();
    }
  }

  return (
    <Stack spacing={2} sx={{ width: "100%", height: "100%" }}>
      <PlayerRegistrationForm />
      {isRegistered && (
        <Container maxWidth="lg" sx={{ textAlign: "center" }} >
          <Paper sx={{ padding: 2 }} >
            <label htmlFor="connect">
              <Typography sx={{ paddingBottom: 2 }}>Connect to RingCon</Typography>
            </label>
            <Button id="connect" variant="contained" onClick={clickHandler}>Connect</Button>
          </Paper>
        </Container>
      )}
    </Stack>
  );
}

"use client";

import { connectedAtom } from "@/lib/atom";
import { useRegistration } from "@/lib/hooks/registration";
import { useStepper } from "@/lib/hooks/stepper";
import { igniteJoyCon } from "@/lib/rincon";
import { Container, Typography, Button } from "@mui/material";
import { useSetAtom } from "jotai";

export default function Connector() {
  const { handleNext } = useStepper();
  const setConnected = useSetAtom(connectedAtom);
  const { PlayerRegistrationForm, isRegistered } = useRegistration();

  async function changeHandler() {
    await igniteJoyCon();
    setConnected(true);
    handleNext();
  }

  return (
    <Container>
      <PlayerRegistrationForm />
      {isRegistered && (
        <>
          <label htmlFor="connect">
            <Typography>Connect to RingCon</Typography>
          </label>
          <Button onClick={changeHandler}>Connect</Button>
        </>
      )}
    </Container>
  );
}

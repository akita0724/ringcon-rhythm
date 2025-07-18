"use client";

import { connectedAtom } from "@/lib/atom";
import { useRegistration } from "@/lib/hooks/registration";
import { useStepper } from "@/lib/hooks/stepper";
import { igniteJoyCon } from "@/lib/rincon";
import { Input, Container, Typography, Button } from "@mui/material";
import { useAtom, useSetAtom } from "jotai";
import { useEffect } from "react";

export default function Connector() {
  const { handleNext, activeStep, setActiveStep } = useStepper();
  const [connected, setConnected] = useAtom(connectedAtom);
  const { PlayerRegistrationForm, isRegistered } = useRegistration();

  async function changeHandler() {
    await igniteJoyCon();
    console.log(activeStep);
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

"use client";

import { useRegistration } from "@/lib/hooks/registration";
import { useStepper } from "@/lib/hooks/stepper";
import { Button, Container, Typography } from "@mui/material";

export default function Starter() {
  const { handleNext } = useStepper();
  const { PlayerRegistrationForm, isRegistered } = useRegistration();

  return (
    <Container>
      <PlayerRegistrationForm />
      { isRegistered && (
        <>
          <Typography>
            Let's begin the game by keyboard!
          </Typography>
          <Button onClick={handleNext}>Start</Button>
        </>
      )}
    </Container>
  );
}
import { useStepper } from "@/lib/hooks/stepper";
import { Button, Container, Typography } from "@mui/material";

export default function Starter() {
  const { handleNext } = useStepper();

  return (
    <Container>
      <Typography>
        Let's begin the game by keyboard!
      </Typography>
      <Button onClick={handleNext}>Start</Button>
    </Container>
  );
}
import { useStepper } from "@/lib/hooks/stepper";
import { Button, Container, Typography } from "@mui/material";

export default function Result() {
  const { handleNext } = useStepper();
  return (
    <Container>
      <Typography>
        Here are outcomes.
      </Typography>
      <Button onClick={handleNext}>Finish</Button>
    </Container>
  );
}
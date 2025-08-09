"use client";

import { useStepper } from "@/lib/hooks/stepper";
import {
  Box,
  Button,
  Container,
  Stack,
  Step,
  StepLabel,
  Stepper,
  Typography,
} from "@mui/material";
import { ReactNode } from "react";

type StepSwitch = {
  steps: string[];
  components: ReactNode[];
};

// The number of steps must be equal to that of components
export default function StepperWrapper({ steps, components }: StepSwitch) {
  const { activeStep, handleReset } = useStepper();

  return (
    <Box sx={{ width: "100vw", height: "100vh", paddingX: 4, paddingY: 8 }}>
      <Stack spacing={5} sx={{ width: "100%", height: "100%" }}>
        <Stepper activeStep={activeStep}>
          {steps.map((label, index) => (
            <Step key={index}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
        {activeStep === steps.length ? (
          <Container maxWidth="lg" sx={{ textAlign: "center" }} >
            <Typography sx={{ padding: 3 }}>All stages have been done!</Typography>
            <Button variant="contained" onClick={handleReset}>Restart!</Button>
          </Container>
        ) : (
          <Box>{components[activeStep]}</Box>
        )}
      </Stack>
    </Box>
  );
}

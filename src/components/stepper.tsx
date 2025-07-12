"use client";

import { useStepper } from "@/lib/hooks/stepper";
import { Box, Button, Container, Step, StepLabel, Stepper, Typography } from "@mui/material";
import { ReactNode } from "react";

type StepSwitch = {
  steps: string[];
  components: ReactNode[];
};

// The number of steps must be equal to that of components
export default function StepperWrapper({ steps, components}: StepSwitch) {
  const { activeStep, handleReset } = useStepper();

  return (
    <Container>
      <Box sx={{ width: "100%" }}>
        <Stepper activeStep={activeStep}>
          {steps.map((label, index) => (
            <Step key={label} >
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
        {activeStep === steps.length ? (
          <Box>
            <Typography>
              All stages have been done!
            </Typography>
            <Button onClick={handleReset}>Restart!</Button>
          </Box>
        ) : (
          <Box>
            {components[activeStep]}
          </Box>
        )}
      </Box>
    </Container>
  );
}
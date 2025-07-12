"use client";

import AlternateType from "@/components/keyboard/keyboardGame";
import Starter from "@/components/keyboard/keyboardStarter";
import Result from "@/components/result";
import StepperWrapper from "@/components/stepper";
import { Box } from "@mui/material";

const steps = ["Registration", "Playing", "Result"];

export default function Home() {
  return (
    <Box>
      <StepperWrapper 
        steps={steps}
        components={[<Starter />, <AlternateType />, <Result />]}
      />
    </Box>
  );
  
}

"use client";

import Result from "@/components/result";
import Connector from "@/components/ringCon/ringConConnector";
import AlternatePlay from "@/components/ringCon/ringConGame";
import StepperWrapper from "@/components/stepper";
import { Box } from "@mui/material";

const steps = ["Connection", "Playing", "Result"];

export default function Home() {

  return (
    <StepperWrapper 
      steps={steps}
      components={[<Connector />, <AlternatePlay />, <Result />]}
    />
  );
}

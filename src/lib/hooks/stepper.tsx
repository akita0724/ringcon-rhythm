import { useState } from "react";

export function useStepper() {
  const [activeStep, setActiveStep] = useState(0);
  
  function handleNext() {
    setActiveStep((prev) => prev + 1);
  }

  function handleReset() {
    setActiveStep(0);
  }

  return {
    activeStep,
    handleNext,
    handleReset
  };
}
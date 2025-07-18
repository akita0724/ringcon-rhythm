import { activeStepAtom } from "@/lib/atom";
import { useAtom } from "jotai";

export function useStepper() {
  const [activeStep, setActiveStep] = useAtom(activeStepAtom);

  function handleNext() {
    setActiveStep((prev) => prev + 1);
  }

  function handleReset() {
    setActiveStep(0);
  }

  return {
    activeStep,
    handleNext,
    handleReset,
  };
}

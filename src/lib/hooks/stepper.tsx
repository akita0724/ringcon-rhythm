import { activeStepAtom } from "@/lib/atom";
import { useAtom } from "jotai";

export function useStepper() {
  const [activeStep, setActiveStep] = useAtom(activeStepAtom);

  function handleNext(nextStep?: number) {
    nextStep ? setActiveStep(nextStep) : setActiveStep((prev) => prev + 1);
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

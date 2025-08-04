import { MissLimit } from "@/consts/constraints";
import { missCountAtom, playerNames } from "@/lib/atom";
import { useStepper } from "@/lib/hooks/stepper";
import { Button, Container, Typography } from "@mui/material";
import { useAtomValue } from "jotai";

export default function Result() {
  const { handleNext } = useStepper();

  const [first, second] = useAtomValue(playerNames);

  const missCount = useAtomValue(missCountAtom);

  const firstMoverScore = MissLimit-missCount[0];
  const secondMoverScore = MissLimit-missCount[1];
  
  return (
    <Container>
      <Typography>
        Here are outcomes.
      </Typography>
      <Typography>
        {first} { firstMoverScore > secondMoverScore ? "Won!" : "Lost..." }
        The score is {firstMoverScore}
      </Typography>
      <Typography>
        {second} { firstMoverScore < secondMoverScore ? "Won!" : "Lost..." }
        The score is {secondMoverScore}
      </Typography>
      <Button onClick={handleNext}>Finish</Button>
    </Container>
  );
}
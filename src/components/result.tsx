import { MissLimit } from "@/consts/constraints";
import { missCountAtom, playerNames } from "@/lib/atom";
import { useStepper } from "@/lib/hooks/stepper";
import { Button, Container, Typography, Paper } from "@mui/material";
import { useAtomValue } from "jotai";
import Confetti from "react-confetti"

export default function Result() {
  const { handleNext } = useStepper();

  const [first, second] = useAtomValue(playerNames);

  const missCount = useAtomValue(missCountAtom);

  const firstMoverScore = MissLimit-missCount[0];
  const secondMoverScore = MissLimit-missCount[1];
  
  return (
    <Container maxWidth="lg" sx={{ textAlign: "center" }}>
      <Confetti width={window.screen.width} height={window.screen.height} />
      <Paper sx={{ padding: 3 }} >
        <Typography variant="h5" >
          Here are outcomes.
        </Typography>
        <Typography variant="h6" sx={{ padding: 2 }}>
          {first}: { firstMoverScore > secondMoverScore ? "Won! " : firstMoverScore === secondMoverScore ? "Draw! " : "Lost... " }
          The score is {firstMoverScore}
        </Typography>
        <Typography variant="h6" sx={{ padding: 2 }}>
          {second}: { firstMoverScore < secondMoverScore ? "Won! " : firstMoverScore === secondMoverScore ? "Draw! " : "Lost... " }
          The score is {secondMoverScore}
        </Typography>
        <Button variant="contained" onClick={() => handleNext()}>Finish</Button>
      </Paper>
      
    </Container>
  );
}
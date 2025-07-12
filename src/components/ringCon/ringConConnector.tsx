"use client";

import { connectedAtom } from "@/lib/atom";
import { useStepper } from "@/lib/hooks/stepper";
import { igniteJoyCon } from "@/lib/rincon";
import { Input, Container, Typography } from "@mui/material";
import { useSetAtom } from "jotai";

export default function Connector() {
  const { handleNext } = useStepper();
  const setConnected = useSetAtom(connectedAtom);

  async function changeHandler() {
    handleNext();
    await igniteJoyCon();
    setConnected(true);
  }

  return (
    <Container>
      <label htmlFor="connect">
        <Typography>
          Connect to RingCon
        </Typography>
      </label>
      <Input name="connect" type="button" value="Connection" onChange={changeHandler} />
    </Container>
  );
}
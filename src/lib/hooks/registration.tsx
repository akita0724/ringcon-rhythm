import { Button, Input, Stack} from "@mui/material";
import { useAtom } from "jotai";
import { playerNames } from "../atom";
import { useState } from "react";

export function useRegistration() {
  const [players, setPlayers] = useAtom(playerNames);
  const [isRegistered, setIsRegistered] = useState(false);

  function handleRegister() {
    const [first, second] = players.map((name) => name.trim());
    if ( first=== "" || second === "") return;
    setIsRegistered(true);
  }

  const PlayerRegistrationForm = () => (
    <Stack 
      direction="row" 
      spacing={2} 
      sx={{ 
        display: "flex", 
        justifyContent: "center", 
        alignItems: "center", 
        width: "100%", 
        height: "100%" 
      }} 
    >
      <Input placeholder="first player" value={players[0]} onChange={(e) => setPlayers((prev) => ([e.target.value, prev[1]]))} />
      <Input placeholder="second player" value={players[1]} onChange={(e) => setPlayers((prev) => ([prev[0], e.target.value]))} />
      <Button variant="contained" onClick={handleRegister}>Register</Button>
    </Stack>
  );

  return {
    PlayerRegistrationForm,
    isRegistered
  }
}
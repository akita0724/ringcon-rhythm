import { Button, Input } from "@mui/material";
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
    <>
      <Input placeholder="first mover" value={players[0]} onChange={(e) => setPlayers((prev) => ([e.target.value, prev[1]]))} />
      <Input placeholder="second mover" value={players[1]} onChange={(e) => setPlayers((prev) => ([prev[0], e.target.value]))} />
      <Button onClick={handleRegister}>Register</Button>
    </>
  );

  return {
    PlayerRegistrationForm,
    isRegistered
  }
}
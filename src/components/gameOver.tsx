"use client";

import { useAtom, useSetAtom } from "jotai";
import {
  gameOverAtom,
  missCountAtom,
  playerNames,
  nodesAtom,
  currentNodeAtom,
  turnStartTimeAtom,
  turnAtom,
} from "@/lib/atom";

export const GameOver = () => {
  const [missCount] = useAtom(missCountAtom);
  const [names] = useAtom(playerNames);
  const setGameOver = useSetAtom(gameOverAtom);
  const setMissCount = useSetAtom(missCountAtom);
  const setNodes = useSetAtom(nodesAtom);
  const setCurrentNode = useSetAtom(currentNodeAtom);
  const setStartTime = useSetAtom(turnStartTimeAtom);
  const setTurn = useSetAtom(turnAtom);

  const resetGame = () => {
    setGameOver(false);
    setMissCount([0, 0]);
    setNodes([]);
    setCurrentNode(0);
    setStartTime(null);
    setTurn(0);
  };

  const winner = missCount[0] > missCount[1] ? names[1] : names[0];
  const isDraw = missCount[0] === missCount[1];

  return (
    <div className="fixed inset-0 bg-opacity-80 flex items-center justify-center z-50 pt-10 flex-col gap 5">
      <h1 className="text-4xl font-bold">Game Over</h1>
      <h2 className="text-2xl mt-4">
        {isDraw ? "It's a Draw!" : `🎉 Winner: ${winner} 🎉`}
      </h2>
      <h3>
        {names[0]}: {missCount[0]} misses, {names[1]}: {missCount[1]} misses
      </h3>
    </div>
  );
};

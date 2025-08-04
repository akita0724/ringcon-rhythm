"use client";

import { useEffect } from "react";
import { RightTurn, LeftTurn , Info } from "@/components/turn";
import { FinishedNodes } from "@/components/info";
import {
  currentNodeAtom,
  missCountAtom,
  nodesAtom,
  turnAtom,
  turnStartTimeAtom,
} from "@/lib/atom";
import { useAtom } from "jotai";
import { createHandleKeyDown } from "@/lib/handleInput";
import { useStepper } from "@/lib/hooks/stepper";


export default function AlternateType() {
  const { handleNext } = useStepper();

  const [turn, setTurn] = useAtom(turnAtom);
  const [nodes, setNodes] = useAtom(nodesAtom);
  const [startTime, setStartTime] = useAtom(turnStartTimeAtom);
  const [currentNode, setCurrentNode] = useAtom(currentNodeAtom);
  const [missCount, setMissCount] = useAtom(missCountAtom);

  useEffect(() => {
    const handleKeyDown = createHandleKeyDown(
      turn,
      startTime,
      setStartTime,
      nodes,
      setNodes,
      currentNode,
      setCurrentNode,
      setMissCount,
      setTurn,
    );

    window.addEventListener("keydown", handleKeyDown);
    console.log("Current node:", nodes);
    console.log("Miss count:", missCount);

    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    turn,
    startTime,
    nodes,
    currentNode,
    setStartTime,
    setNodes,
    setCurrentNode,
    setMissCount,
    missCount,
  ]);

  if (nodes.length === currentNode) {
    handleNext();
  }

  return (
    <div>
      <RightTurn  />
      <LeftTurn />
      <Info />
      <FinishedNodes />
    </div>
  );
}
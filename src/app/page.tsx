"use client";

import { useEffect } from "react";
import { Right_Turn, Left_Turn } from "@/components/turn";
import {
  currentNodeAtom,
  missCountAtom,
  nodesAtom,
  turnAtom,
  turnStartTimeAtom,
} from "@/lib/atom";
import { useAtom } from "jotai";
import { convertKeyToInput, createHandleKeyDown } from "@/lib/handleInput";

export default function Home() {
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

  return (
    <div>
      <Right_Turn turn={turn} />
      <Left_Turn turn={turn} />
    </div>
  );
}

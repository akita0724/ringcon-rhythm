import { Node } from "@/types/node";
import { addNode } from "./addNode";

export const createHandleKeyDown = (
  turn: number,
  startTime: Date | null,
  setStartTime: (time: Date) => void,
  nodes: Node[],
  setNodes: (nodes: Node[] | ((prev: Node[]) => Node[])) => void,
  currentNode: number,
  setCurrentNode: (node: number | ((prev: number) => number)) => void,
  setMissCount: (fn: (prev: [number, number]) => [number, number]) => void,
  setTurn: (prev: number) => void,
) => {
  return (e: KeyboardEvent) => {
    const input = convertKeyToInput(e.key);
    if (input) {
      addNode(
        input,
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
    }
  };
};

export const convertKeyToInput = (key: string): number | null => {
  if (key === "ArrowRight") {
    return 1; // Right turn
  } else if (key === "ArrowLeft") {
    return 2; // Left turn
  }
  return null; // No valid input
};

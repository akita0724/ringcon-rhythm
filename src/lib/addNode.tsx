import { useAtom, useAtomValue, useSetAtom } from "jotai";
import {
  currentNodeAtom,
  missCountAtom,
  nodesAtom,
  turnAtom,
  turnStartTimeAtom,
} from "./atom";
import { Node } from "@/types/node";

export const addNode = function (input: number) {
  const turn = useAtomValue(turnAtom);
  const [startTime, setStartTime] = useAtom(turnStartTimeAtom);
  const [nodes, setNodes] = useAtom(nodesAtom);
  const [currentNode, setCurrentNode] = useAtom(currentNodeAtom);
  const setMissCount = useSetAtom(missCountAtom);

  let effectiveStartTime = startTime;

  if (!effectiveStartTime) {
    effectiveStartTime = new Date();
    setStartTime(effectiveStartTime); // Initialize atom if it was null
  }

  const currentTime = new Date();

  // 時間差(ms)
  const elapsedTime =
    currentTime.getTime() * 1000 +
    currentTime.getMilliseconds() -
    effectiveStartTime.getTime() * 1000 +
    effectiveStartTime.getMilliseconds();

  // 末尾の場合
  if (currentNode >= nodes.length) {
    const newNode: Node = {
      input: input,
      time: elapsedTime,
    };
    setNodes((prev) => [...prev, newNode]);
  } else {
    setCurrentNode((prev) => prev + 1);
    if (judgeNode(input, nodes[currentNode], elapsedTime)) {
      // OKの場合
    } else {
      // NGの場合
      if (turn === 1) {
        setMissCount((prev) => [prev[0], prev[1] + 1]);
      } else if (turn === -1) {
        setMissCount((prev) => [prev[0] + 1, prev[1]]);
      }
    }
  }
};

// 誤差の許容範囲
const tolerance = 100;

const judgeNode = (input: number, node: Node, elapsedTime: number): boolean => {
  return (
    node.input === input &&
    elapsedTime >= node.time - tolerance &&
    elapsedTime <= node.time + tolerance
  );
};

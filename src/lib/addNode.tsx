import { Node } from "@/types/node";

export const addNode = function (
  input: number,
  turn: number,
  startTime: Date | null,
  setStartTime: (time: Date) => void,
  nodes: Node[],
  setNodes: (nodes: Node[] | ((prev: Node[]) => Node[])) => void,
  currentNode: number,
  setCurrentNode: (node: number | ((prev: number) => number)) => void,
  setMissCount: (fn: (prev: [number, number]) => [number, number]) => void,
  setTurn: (prev: number) => void,
) {
  let effectiveStartTime = startTime;

  if (!effectiveStartTime) {
    effectiveStartTime = new Date();
    setStartTime(effectiveStartTime); // Initialize atom if it was null
  }

  const currentTime = new Date();

  // 時間差(ms)
  const elapsedTime =
    currentTime.getTime() -
    effectiveStartTime.getTime();

  if (turn === 0) {
    setTurn(1); // 初回は右ターン
  }

  // 末尾の場合
  if (currentNode >= nodes.length) {
    const newNode: Node = {
      input: input,
      time: elapsedTime,
    };
    setNodes((prev) => [...prev, newNode]);
    setCurrentNode(0);
    setTurn(turn * -1); // ターンを反転
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

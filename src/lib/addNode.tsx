import { Node } from "@/types/node";

export const addNode = function (
  strain: number,
  quaternion: [number, number, number],
  turn: number,
  startTime: Date | null,
  setStartTime: (time: Date | null) => void,
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
  const elapsedTime = currentTime.getTime() - effectiveStartTime.getTime();

  if (turn === 0) {
    setTurn(1); // 初回は右ターン
  }

  // 末尾の場合
  if (currentNode >= nodes.length) {
    const newNode: Node = {
      strain,
      quaternion,
      time: elapsedTime,
    };
    setNodes((prev) => [...prev, newNode]);
    setCurrentNode(0);
    setTurn(turn * -1); // ターンを反転
    setStartTime(null);
  } else {
    setCurrentNode((prev) => prev + 1);
    if (judgeNode(strain, quaternion, nodes[currentNode], elapsedTime)) {
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
const timeTolerance = 100;
const strainTolerance = 128;
const degreeTolerance = 45;

const judgeNode = (strain:number, quaternion: [number, number, number], node: Node, elapsedTime: number): boolean => {
  const properStrain =  node.strain - strainTolerance <= strain && strain <= node.strain + strainTolerance;
  const properDegree = node.quaternion[0] - degreeTolerance <= quaternion[0] && quaternion[0] <= node.quaternion[0] + degreeTolerance
    && node.quaternion[1] - degreeTolerance <= quaternion[1] && quaternion[1] <= node.quaternion[1] + degreeTolerance
    && node.quaternion[2] - degreeTolerance <= quaternion[2] && quaternion[2] <= node.quaternion[2] + degreeTolerance
  const properTime = node.time - timeTolerance <= elapsedTime && elapsedTime <= node.time + timeTolerance

  return properStrain && properDegree && properTime;
};

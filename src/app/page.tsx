"use client";

import { useEffect } from "react";
import { Right_Turn, Left_Turn } from "@/components/turn";
import {
  baseValueAtom,
  connectedAtom,
  currentNodeAtom,
  isPlessedAtom,
  missCountAtom,
  nodesAtom,
  turnAtom,
  turnStartTimeAtom,
} from "@/lib/atom";
import { useAtom, useSetAtom } from "jotai";
import { igniteJoyCon, useRingConValues } from "@/lib/rincon";
import { addNode } from "@/lib/addNode";
import { connectJoyCon, connectedJoyCons  } from "joy-con-webhid";

const NEUTRAL_STRAIN_RADIUS = 0x0200;
const NEUTRAL_STRAIN_RADIUS_MARGIN = 0x0010;

export default function Home() {
  // 1が右の人、-1が左の人のターン
  const [turn, setTurn] = useAtom(turnAtom);
  // 譜面
  const [nodes, setNodes] = useAtom(nodesAtom);
  const [startTime, setStartTime] = useAtom(turnStartTimeAtom);
  const [currentNode, setCurrentNode] = useAtom(currentNodeAtom);
  // ミス数の配列 [左, 右]
  const [_missCount, setMissCount] = useAtom(missCountAtom);
  const [connected, setConnected] = useAtom(connectedAtom);
  const setIsPressed = useSetAtom(isPlessedAtom);
  const [baseValue, setBaseValue] = useAtom(baseValueAtom);

  useEffect(() => {
    const rightController = useRingConValues();

    const handleInputReport = (event: HIDInputReportEvent) => {
      if (!connected) return;

      const data = rightController.strain;

      setIsPressed((prev) => {
        if (prev) {
          if (
            baseValue - NEUTRAL_STRAIN_RADIUS + NEUTRAL_STRAIN_RADIUS_MARGIN <=
              data &&
            data <=
              baseValue + NEUTRAL_STRAIN_RADIUS - NEUTRAL_STRAIN_RADIUS_MARGIN
          ) {
            return false;
          }
          return true;
        }

        if (data < baseValue - NEUTRAL_STRAIN_RADIUS) {
          addNode(
            1,
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
          return true;
        } else if (data > baseValue + NEUTRAL_STRAIN_RADIUS) {
          addNode(
            2,
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
          return true;
        }
        return false;
      });
    };

  }, [
    connected,
    baseValue,
    turn,
    startTime,
    setStartTime,
    nodes,
    setNodes,
    currentNode,
    setCurrentNode,
    setMissCount,
    setTurn,
  ]);

  return (
    <div>
      <Right_Turn turn={turn} />
      <button
        hidden={connected}
        onClick={async () => {
          await igniteJoyCon();
          setConnected(true);
        }}
      >
        リングコンに接続する
      </button>
      <Left_Turn turn={turn} />
      {/* <Info /> */}
    </div>
  );
}

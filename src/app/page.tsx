"use client";

import { useEffect } from "react";
import { RightTurn, LeftTurn } from "@/components/turn";
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
import { useRingCon } from "@/lib/rincon";
import { addNode } from "@/lib/addNode";

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

  const ringcon = useRingCon(setBaseValue);

  // useEffect(() => {
  //   const handleKeyDown = createHandleKeyDown(
  //     turn,
  //     startTime,
  //     setStartTime,
  //     nodes,
  //     setNodes,
  //     currentNode,
  //     setCurrentNode,
  //     setMissCount,
  //     setTurn,
  //   );

  //   window.addEventListener("keydown", handleKeyDown);
  //   console.log("Current node:", nodes);
  //   console.log("Miss count:", missCount);

  //   return () => window.removeEventListener("keydown", handleKeyDown);
  // }, [
  //   turn,
  //   startTime,
  //   nodes,
  //   currentNode,
  //   setStartTime,
  //   setNodes,
  //   setCurrentNode,
  //   setMissCount,
  //   missCount,
  // ]);

  useEffect(() => {
    const device = ringcon.getConnectedDevice();
    if (!device || !connected) return;

    const handleInputReport = (event: HIDInputReportEvent) => {
      if (!connected) return;
      if (event.reportId !== 0x30) return;

      const data = ringcon.extractStrainValueFromBuffer(event.data.buffer);

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

    device.addEventListener("inputreport", handleInputReport);
    return () => {
      device.removeEventListener("inputreport", handleInputReport);
    };
  }, [
    ringcon,
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
      
      <RightTurn/>
      <button
        hidden={connected}
        onClick={async () => {
          await ringcon.connectRingCon();
          setConnected(true);
        }}
      >
        リングコンに接続する
      </button>
      <LeftTurn/>
    
    </div>
  );
}

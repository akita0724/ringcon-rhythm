"use client";

import { useStepper } from "@/lib/hooks/stepper";
import { Box } from "@mui/material";
import { useEffect, useState } from "react";
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
import { useAtom, useAtomValue, useSetAtom } from "jotai";
import { useRingConValues } from "@/lib/rincon";
import { addNode } from "@/lib/addNode";
import { MissLimit } from "@/consts/constraints";

// Make buffer to prevent the joy-con from detecting minor movement since players don't intend it to start with just touch.
// Make the function detect movement both for pressing and pulling.
// Refer to https://github.com/mascii/demo-of-ring-con-with-web-hid/blob/main/index.html
const NEUTRAL_STRAIN = 3000;
const NEUTRAL_STRAIN_RADIUS = 1024;
const NEUTRAL_STRAIN_RADIUS_MARGIN = 16;

export default function AlternatePlay() {
  const { handleNext } = useStepper();

  // 1が右の人、-1が左の人のターン
  const [turn, setTurn] = useAtom(turnAtom);
  // 譜面
  const [nodes, setNodes] = useAtom(nodesAtom);
  const [startTime, setStartTime] = useAtom(turnStartTimeAtom);
  const [currentNode, setCurrentNode] = useAtom(currentNodeAtom);
  // ミス数の配列 [左, 右]
  const [missCount, setMissCount] = useAtom(missCountAtom);
  const connected = useAtomValue(connectedAtom);
  const setIsPressed = useSetAtom(isPlessedAtom);
  const [, _setBaseValue] = useAtom(baseValueAtom);
  // Gain values per cycle.
  const [isMoving, setIsMoving] = useState(false);
  const [isPulling, setIsPulling] = useState(false);
  const [strainValues, setStrainValues] = useState<number[]>([]);
  const [strainPerCycle, setStrainPerCycle] = useState(0);
  const [quaternionValues, setQuaternionValues] = useState<[number, number, number][]>([]);
  const [quaternionPerCycle, setQuaternionPerCycle] = useState<[number, number, number]>([0, 0, 0]);

  const { strain, quaternion } = useRingConValues();

  useEffect(() => {

    if (isMoving) {
      // Continuation → Record values.
      setStrainValues((prev) => [...prev, strain]);

      // Finish when it goes back to neutral area.
      if (NEUTRAL_STRAIN - NEUTRAL_STRAIN_RADIUS + NEUTRAL_STRAIN_RADIUS_MARGIN <= strain &&
          strain <= NEUTRAL_STRAIN + NEUTRAL_STRAIN_RADIUS - NEUTRAL_STRAIN_RADIUS_MARGIN) {

        const peakStrain = isPulling ? Math.min(...strainValues) : Math.max(...strainValues)
        setStrainPerCycle(peakStrain);
        const index = strainValues.indexOf(peakStrain);
        setQuaternionPerCycle(quaternionValues[index]);

        setIsMoving(false);
        setIsPulling(false);
        setStrainValues([]); 
        setQuaternionValues([]);
      }
    } else {
      // Detect the beginning of the movement.
      if (strain < NEUTRAL_STRAIN - NEUTRAL_STRAIN_RADIUS) {
        setIsMoving(true);
        setIsPulling(true);

        // Start to record new pulling.
        setStrainValues([strain]);
        setQuaternionValues([toNumericalQuaternion(quaternion)]) 
      } else if (NEUTRAL_STRAIN + NEUTRAL_STRAIN_RADIUS < strain) {
        setIsMoving(true);

        // Start to record new pressing.
        setStrainValues([strain]) 
        setQuaternionValues([toNumericalQuaternion(quaternion)]) 
      }
    }

  }, [strain]);

  // Ring-Conデータの変化を監視してコマンドを抽出
  useEffect(() => {
    if (!connected) return;

    if (!isMoving && strainPerCycle !== 0) {
      console.log("joy con is moving");
      setIsPressed(true);
      addNode(
        strainPerCycle,
        quaternionPerCycle,
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
    } else {
      setIsPressed(false);
    }
  }, [
    strainPerCycle,
    connected,
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

  // ゲーム終了判定をuseEffectに移動
  useEffect(() => {
    if (MissLimit-missCount[0] <= 0 || MissLimit-missCount[1] <= 0) {
      // If this function is properly called just once, you can call this without passing any number.
      handleNext(2);
    }
  }, [missCount]);

  return (
    <Box>
      <LeftTurn />
      <RightTurn />
    </Box>
  );
}

function toNumericalQuaternion(value: {alpha: string, beta: string, gamma: string}): [number, number, number] {
  // [TODO] Check how to convert from string to number.
  return [
    Number(value.alpha),
    Number(value.beta),
    Number(value.gamma)
  ];
}
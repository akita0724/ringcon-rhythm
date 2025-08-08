"use client";

import { useStepper } from "@/lib/hooks/stepper";
import { alpha, Box } from "@mui/material";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
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
import { RingConInitialStickValue, useRingConValues } from "@/lib/rincon";
import { addNode } from "@/lib/addNode";
import { extractCommand } from "@/lib/extractCommand";
import { MissLimit } from "@/consts/constraints";

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
  // 各サイクルごとに値を取得
  const [isMoving, setIsMoving] = useState(false);
  const [isPulling, setIsPulling] = useState(false);
  const [strainValues, setStrainValues] = useState<number[]>([]);
  const [strainPerCycle, setStrainPerCycle] = useState(0);
  const [quaternionValues, setQuaternionValues] = useState<[number, number, number][]>([]);
  const [quaternionPerCycle, setQuaternionPerCycle] = useState<[number, number, number]>([0, 0, 0]);

  const { strain, quaternion } = useRingConValues();

  useEffect(() => {

    if (isMoving) {
      // 継続中 → 値を記録
      setStrainValues((prev) => [...prev, strain]);

      // 中立域に戻ったら押し終了
      if (NEUTRAL_STRAIN - NEUTRAL_STRAIN_RADIUS + NEUTRAL_STRAIN_RADIUS_MARGIN <= strain &&
          strain <= NEUTRAL_STRAIN + NEUTRAL_STRAIN_RADIUS - NEUTRAL_STRAIN_RADIUS_MARGIN) {

        // 押し終わり時に max を求める
        const peakStrain = isPulling ? Math.min(...strainValues) : Math.max(...strainValues)
        setStrainPerCycle(peakStrain);

        const index = strainValues.indexOf(peakStrain);
        setQuaternionPerCycle(quaternionValues[index]);

        setIsMoving(false);
        setIsPulling(false);

        // バッファをリセット
        setStrainValues([]); 
        setQuaternionValues([]);
      }
    } else {
      // 始め検出
      if (strain < NEUTRAL_STRAIN - NEUTRAL_STRAIN_RADIUS) {
        setIsMoving(true);
        setIsPulling(true);

        // 新しい引きの記録開始
        setStrainValues([strain]);
        setQuaternionValues([toNumericalQuaternion(quaternion)]) 
      } else if (NEUTRAL_STRAIN + NEUTRAL_STRAIN_RADIUS < strain) {
        setIsMoving(true);

        // 新しい押しの記録開始
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
  return [
    Number(value.alpha),
    Number(value.beta),
    Number(value.gamma)
  ];
}
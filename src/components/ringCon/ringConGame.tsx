"use client";

import { useStepper } from "@/lib/hooks/stepper";
import { Box } from "@mui/material";
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
import { useAtom, useAtomValue, useSetAtom } from "jotai";
import { useRingConValues } from "@/lib/rincon";
import { addNode } from "@/lib/addNode";
import { extractCommand } from "@/lib/extractCommand";
import { MissLimit } from "@/consts/constraints";

const NEUTRAL_STRAIN_RADIUS = 0x0200;
const NEUTRAL_STRAIN_RADIUS_MARGIN = 0x0010;

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

  const rightController = useRingConValues();

  // Ring-Con の接続状態とデータをログ出力
  useEffect(() => {
    console.log("Ring-Con connected:", connected);
    console.log("Ring-Con controller data:", rightController);

    // Ring-Conのデータを定期的にチェック
    const interval = setInterval(() => {
      if (connected && rightController) {
        console.log("Periodic Ring-Con data check:", rightController);
        const command = extractCommand(rightController);
        console.log("Periodic command extraction:", command);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [connected, rightController]);

  // Ring-Conデータの変化を監視してコマンドを抽出
  useEffect(() => {
    if (!connected) return;

    console.log("Ring-Con Data:", rightController);
    const command = extractCommand(rightController);
    console.log("Extracted Command:", command);

    if (command !== 0) {
      console.log("Non-zero command detected:", command);
      setIsPressed(true);
      addNode(
        command,
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
    rightController,
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

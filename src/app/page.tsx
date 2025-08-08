"use client";

import { useEffect } from "react";
import { RightTurn, LeftTurn, Info } from "@/components/turn";
import { GameOver } from "@/components/gameOver";
import { MotionDebug } from "@/components/motionDebug";
import {
  baseValueAtom,
  connectedAtom,
  currentNodeAtom,
  isPlessedAtom,
  missCountAtom,
  nodesAtom,
  playerNames,
  turnAtom,
  turnStartTimeAtom,
  gameOverAtom,
  motionDataAtom,
  lastTiltCommandAtom,
} from "@/lib/atom";
import { useAtom, useSetAtom } from "jotai";
import { useRingCon } from "@/lib/rincon";
import { addNode } from "@/lib/addNode";
import {
  analyzeTiltCommand,
  tiltDirectionToInputNumber,
  resetCalibration,
} from "@/lib/motionAnalyzer";

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
  const [gameOver, setGameOver] = useAtom(gameOverAtom);
  const setIsPressed = useSetAtom(isPlessedAtom);
  const [baseValue, setBaseValue] = useAtom(baseValueAtom);
  const [_motionData, setMotionData] = useAtom(motionDataAtom);
  const [lastTiltCommand, setLastTiltCommand] = useAtom(lastTiltCommandAtom);

  const setUserNames = useSetAtom(playerNames);

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

      // モーションデータを抽出して更新
      const newMotionData = ringcon.extractMotionData(event.data.buffer);
      setMotionData(newMotionData);

      // 傾きコマンドを解析
      const tiltCommand = analyzeTiltCommand(newMotionData);
      if (
        tiltCommand &&
        tiltCommand.intensity > 0.3 && // 強度の閾値を下げる
        (!lastTiltCommand || Date.now() - lastTiltCommand.timestamp > 500) // 間隔を短縮
      ) {
        setLastTiltCommand(tiltCommand);

        // 傾きコマンドをゲーム入力として処理
        const inputNumber = tiltDirectionToInputNumber(tiltCommand.direction);
        if (inputNumber > 0) {
          console.log(
            `Tilt input registered: ${inputNumber} (${tiltCommand.direction})`,
          );
          addNode(
            inputNumber,
            turn,
            startTime,
            setStartTime,
            nodes,
            setNodes,
            currentNode,
            setCurrentNode,
            setMissCount,
            setTurn,
            setGameOver,
          );
          return;
        }
      }

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
            setGameOver,
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
            setGameOver,
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
    setGameOver,
    setMotionData,
    lastTiltCommand,
    setLastTiltCommand,
  ]);

  return (
    <div>
      {gameOver ? (
        <GameOver />
      ) : connected ? (
        <div>
          <MotionDebug />
          <RightTurn />
          <button
            hidden={connected}
            className="z-50"
            onClick={async () => {
              await ringcon.connectRingCon();
              setConnected(true);
            }}
          >
            リングコンに接続する
          </button>
          <LeftTurn />
          <Info />
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center h-screen">
          <h1 className="text-2xl font-bold mb-4">
            リングコンに接続してください
          </h1>
          <div className="flex flex-row text-center">
            <input
              type="text"
              placeholder="プレイヤー１"
              className="border border-gray-300 rounded px-4 py-2 mb-4 mr-2"
              onChange={(e) => {
                setUserNames((prev) => [e.target.value, prev[1] || ""]);
              }}
            />
            <input
              type="text"
              placeholder="プレイヤー２"
              className="border border-gray-300 rounded px-4 py-2 mb-4"
              onChange={(e) => {
                setUserNames((prev) => [prev[0] || "", e.target.value]);
              }}
            />
          </div>
          <button
            className="bg-blue-500 text-white px-4 py-2 rounded"
            onClick={async () => {
              resetCalibration(); // 校正をリセット
              await ringcon.connectRingCon();
              setConnected(true);
            }}
          >
            接続する
          </button>
        </div>
      )}
    </div>
  );
}

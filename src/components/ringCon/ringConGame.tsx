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

  // Ring-Con の状態管理
  const [isMoving, setIsMoving] = useState(false);
  const [isPulling, setIsPulling] = useState(false);
  const [strainValues, setStrainValues] = useState<number[]>([]);
  const [strainPerCycle, setStrainPerCycle] = useState(0);
  const [quaternionValues, setQuaternionValues] = useState<
    { x: number; y: number; z: number; w: number }[]
  >([]);
  const [quaternionPerCycle, setQuaternionPerCycle] = useState<{
    x: number;
    y: number;
    z: number;
    w: number;
  }>({ x: 0, y: 0, z: 0, w: 1 });

  const { strain, quaternion, rawQuaternion, acc, gyro } = useRingConValues();

  // デバッグ：Ring-Conから取得されるデータの構造を確認
  useEffect(() => {
    console.log("Raw Ring-Con data:", {
      strain,
      quaternion,
      rawQuaternion,
      acc,
      gyro,
    });
    console.log("Accelerometer:", acc);
    console.log("Gyroscope:", gyro);
    console.log("Raw Quaternion:", rawQuaternion);
  }, [strain, quaternion, rawQuaternion, acc, gyro]);

  // 加速度計による方向判定関数
  const extractDirectionFromAccelerometer = (acceleration: {
    x: number;
    y: number;
    z: number;
  }): number => {
    const { x, y, z } = acceleration;

    // しきい値を設定（加速度の値）
    const ACCEL_THRESHOLD = 0.2; // 0.2G以上の傾きで方向判定

    // 最も大きな変化を示す軸を優先
    const maxAbsValue = Math.max(Math.abs(x), Math.abs(y), Math.abs(z));

    if (maxAbsValue < ACCEL_THRESHOLD) {
      return 0; // Neutral
    }

    // 最も大きな変化を示す軸で判定
    if (Math.abs(y) === maxAbsValue) {
      if (y > ACCEL_THRESHOLD) {
        console.log("Direction: UP (accelerometer)");
        return 3; // Up
      } else if (y < -ACCEL_THRESHOLD) {
        console.log("Direction: DOWN (accelerometer)");
        return 4; // Down
      }
    }

    if (Math.abs(x) === maxAbsValue) {
      if (x < -ACCEL_THRESHOLD) {
        console.log("Direction: LEFT (accelerometer)");
        return 1; // Left
      } else if (x > ACCEL_THRESHOLD) {
        console.log("Direction: RIGHT (accelerometer)");
        return 2; // Right
      }
    }

    return 0; // Neutral
  };

  // ジャイロスコープによる方向判定関数
  const extractDirectionFromGyroscope = (gyroscope: {
    x: number;
    y: number;
    z: number;
  }): number => {
    const { x, y, z } = gyroscope;

    // ジャイロスコープのしきい値（回転速度 rad/s）
    const GYRO_THRESHOLD = 0.1; // 0.1 rad/s以上の回転で方向判定

    console.log("Gyro values - x:", x, "y:", y, "z:", z);

    // 最も大きな回転を示す軸を優先
    const maxAbsValue = Math.max(Math.abs(x), Math.abs(y), Math.abs(z));

    if (maxAbsValue < GYRO_THRESHOLD) {
      return 0; // Neutral
    }

    // X軸回転（前後の傾き）
    if (Math.abs(x) === maxAbsValue) {
      if (x > GYRO_THRESHOLD) {
        console.log("Direction: UP (gyroscope)");
        return 3; // Up (前に傾ける)
      } else if (x < -GYRO_THRESHOLD) {
        console.log("Direction: DOWN (gyroscope)");
        return 4; // Down (後ろに傾ける)
      }
    }

    // Z軸回転（左右の傾き）
    if (Math.abs(z) === maxAbsValue) {
      if (z > GYRO_THRESHOLD) {
        console.log("Direction: LEFT (gyroscope)");
        return 5; // Left
      } else if (z < -GYRO_THRESHOLD) {
        console.log("Direction: RIGHT (gyroscope)");
        return 6; // Right
      }
    }

    return 0; // Neutral
  };

  // Ring-Con の動き検出（strain ベース）
  useEffect(() => {
    if (isMoving) {
      // 継続中 → 値を記録
      setStrainValues((prev) => [...prev, strain]);
      setQuaternionValues((prev) => [...prev, rawQuaternion]);

      // 中立域に戻ったら押し終了
      if (
        NEUTRAL_STRAIN - NEUTRAL_STRAIN_RADIUS + NEUTRAL_STRAIN_RADIUS_MARGIN <=
          strain &&
        strain <=
          NEUTRAL_STRAIN + NEUTRAL_STRAIN_RADIUS - NEUTRAL_STRAIN_RADIUS_MARGIN
      ) {
        // 押し終わり時に max を求める
        const peakStrain = isPulling
          ? Math.min(...strainValues)
          : Math.max(...strainValues);
        setStrainPerCycle(peakStrain);

        const index = strainValues.indexOf(peakStrain);
        const peakQuaternion = quaternionValues[index];

        // 加速度計とジャイロスコープの両方で方向判定
        const directionFromAcc = extractDirectionFromAccelerometer(acc);
        const directionFromGyro = extractDirectionFromGyroscope(gyro);

        // どちらかで方向が検出されたら使用（加速度計を優先）
        const direction =
          directionFromAcc !== 0 ? directionFromAcc : directionFromGyro;

        console.log("Direction from accelerometer:", directionFromAcc);
        console.log("Direction from gyroscope:", directionFromGyro);
        console.log("Final direction:", direction);

        // クォータニオンに方向情報を格納（方向を x に保存）
        const finalQuaternion =
          direction !== 0
            ? {
                x: direction,
                y: peakQuaternion.y,
                z: peakQuaternion.z,
                w: peakQuaternion.w,
              }
            : peakQuaternion;

        setQuaternionPerCycle(finalQuaternion);

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
        setQuaternionValues([rawQuaternion]);
      } else if (NEUTRAL_STRAIN + NEUTRAL_STRAIN_RADIUS < strain) {
        setIsMoving(true);

        // 新しい押しの記録開始
        setStrainValues([strain]);
        setQuaternionValues([rawQuaternion]);
      }
    }
  }, [strain, quaternion, acc, gyro]);

  // Ring-Con コマンド処理
  useEffect(() => {
    if (!connected) return;

    if (!isMoving && strainPerCycle !== 0) {
      console.log("Ring-Con command detected");
      console.log("strainPerCycle:", strainPerCycle);
      console.log("quaternionPerCycle:", quaternionPerCycle);
      console.log("Direction:", quaternionPerCycle.x);

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

      // strainPerCycle をリセットして重複実行を防ぐ
      setStrainPerCycle(0);
    } else {
      setIsPressed(false);
    }
  }, [strainPerCycle, isMoving, connected]);

  // リアルタイムでジャイロスコープの値を監視（デバッグ用）
  useEffect(() => {
    if (connected) {
      const interval = setInterval(() => {
        const directionFromAcc = extractDirectionFromAccelerometer(acc);
        const directionFromGyro = extractDirectionFromGyroscope(gyro);

        if (directionFromAcc !== 0 || directionFromGyro !== 0) {
          console.log(
            "Real-time direction - Acc:",
            directionFromAcc,
            "Gyro:",
            directionFromGyro,
          );
        }

        // ジャイロスコープの生の値も表示
        const maxGyroValue = Math.max(
          Math.abs(gyro.x),
          Math.abs(gyro.y),
          Math.abs(gyro.z),
        );
        if (maxGyroValue > 0.05) {
          // 小さな閾値で監視
          console.log("Gyro movement detected:", gyro);
        }
      }, 500); // 0.5秒ごとにチェック

      return () => clearInterval(interval);
    }
  }, [connected]);

  // ゲーム終了判定をuseEffectに移動
  useEffect(() => {
    if (MissLimit - missCount[0] <= 0 || MissLimit - missCount[1] <= 0) {
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

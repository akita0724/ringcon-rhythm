"use client";

import { useAtom } from "jotai";
import { motionDataAtom, lastTiltCommandAtom } from "@/lib/atom";
import {
  tiltDirectionToString,
  getCalibrationStatus,
  setMotionDetectionEnabled,
} from "@/lib/motionAnalyzer";

export const MotionDebug = () => {
  const [motionData] = useAtom(motionDataAtom);
  const [lastTiltCommand] = useAtom(lastTiltCommandAtom);
  const calibrationStatus = getCalibrationStatus();

  // 基準値からの差分を計算（デバッグ表示用）
  const accelDiff = calibrationStatus.baselineAccel
    ? {
        x: motionData.accelerometer.x - calibrationStatus.baselineAccel.x,
        y: motionData.accelerometer.y - calibrationStatus.baselineAccel.y,
        z: motionData.accelerometer.z - calibrationStatus.baselineAccel.z,
      }
    : { x: 0, y: 0, z: 0 };

  const gyroDiff = calibrationStatus.baselineGyro
    ? {
        x: motionData.gyroscope.x - calibrationStatus.baselineGyro.x,
        y: motionData.gyroscope.y - calibrationStatus.baselineGyro.y,
        z: motionData.gyroscope.z - calibrationStatus.baselineGyro.z,
      }
    : { x: 0, y: 0, z: 0 };

  return (
    <div className="fixed top-4 right-4 bg-black/80 text-white p-4 rounded-lg text-sm font-mono z-40 max-w-xs">
      <h3 className="font-bold mb-2">モーションデータ</h3>

      {/* モーション検出の有効/無効切り替え */}
      <div className="mb-2 pb-2 border-b border-gray-600">
        <button
          onClick={() =>
            setMotionDetectionEnabled(!calibrationStatus.motionDetectionEnabled)
          }
          className={`text-xs px-2 py-1 rounded ${
            calibrationStatus.motionDetectionEnabled
              ? "bg-red-600 hover:bg-red-700"
              : "bg-green-600 hover:bg-green-700"
          }`}
        >
          傾き検出: {calibrationStatus.motionDetectionEnabled ? "ON" : "OFF"}
        </button>
      </div>

      {/* 校正状態 */}
      <div className="mb-2 pb-2 border-b border-gray-600">
        <div
          className={`text-${
            calibrationStatus.isCalibrated ? "green" : "yellow"
          }-400`}
        >
          校正: {calibrationStatus.isCalibrated ? "完了" : "進行中"}
        </div>
        {!calibrationStatus.isCalibrated && (
          <div className="text-xs">
            進捗: {Math.round(calibrationStatus.progress * 100)}%
          </div>
        )}
      </div>

      <div className="mb-2">
        <div className="text-green-400">加速度計:</div>
        <div>X: {motionData.accelerometer.x.toFixed(3)}</div>
        <div>Y: {motionData.accelerometer.y.toFixed(3)}</div>
        <div>Z: {motionData.accelerometer.z.toFixed(3)}</div>
        {calibrationStatus.isCalibrated && (
          <div className="text-xs text-gray-400 mt-1">
            差分: X:{accelDiff.x.toFixed(3)} Y:{accelDiff.y.toFixed(3)} Z:
            {accelDiff.z.toFixed(3)}
          </div>
        )}
      </div>

      <div className="mb-2">
        <div className="text-blue-400">ジャイロ:</div>
        <div>X: {motionData.gyroscope.x.toFixed(1)}°/s</div>
        <div>Y: {motionData.gyroscope.y.toFixed(1)}°/s</div>
        <div>Z: {motionData.gyroscope.z.toFixed(1)}°/s</div>
        {calibrationStatus.isCalibrated && (
          <div className="text-xs text-gray-400 mt-1">
            差分: X:{gyroDiff.x.toFixed(1)} Y:{gyroDiff.y.toFixed(1)} Z:
            {gyroDiff.z.toFixed(1)}
          </div>
        )}
      </div>

      {lastTiltCommand && calibrationStatus.motionDetectionEnabled && (
        <div className="border-t border-gray-600 pt-2">
          <div className="text-yellow-400">最後のコマンド:</div>
          <div>{tiltDirectionToString(lastTiltCommand.direction)}</div>
          <div>強度: {(lastTiltCommand.intensity * 100).toFixed(0)}%</div>
          <div className="text-xs text-gray-400">
            {Math.round((Date.now() - lastTiltCommand.timestamp) / 100) / 10}s前
          </div>
        </div>
      )}
    </div>
  );
};

import { MotionData, TiltDirection, TiltCommand } from "@/types/motion";

// 校正用の基準値を保存
let baselineAccel = { x: 0, y: 0, z: 1 }; // 初期値: 重力方向がZ軸
let baselineGyro = { x: 0, y: 0, z: 0 };
let isCalibrated = false;
let calibrationCount = 0;
const CALIBRATION_SAMPLES = 30; // 校正用サンプル数

// モーション検出の有効/無効を切り替え（デバッグ用）
let motionDetectionEnabled = false; // デフォルトで無効

// 校正用の累積値
let accelSum = { x: 0, y: 0, z: 0 };
let gyroSum = { x: 0, y: 0, z: 0 };

// 校正を実行（最初の30フレームで基準値を設定）
export const calibrateMotion = (motionData: MotionData): boolean => {
  if (isCalibrated) return true;

  accelSum.x += motionData.accelerometer.x;
  accelSum.y += motionData.accelerometer.y;
  accelSum.z += motionData.accelerometer.z;

  gyroSum.x += motionData.gyroscope.x;
  gyroSum.y += motionData.gyroscope.y;
  gyroSum.z += motionData.gyroscope.z;

  calibrationCount++;

  if (calibrationCount >= CALIBRATION_SAMPLES) {
    baselineAccel = {
      x: accelSum.x / CALIBRATION_SAMPLES,
      y: accelSum.y / CALIBRATION_SAMPLES,
      z: accelSum.z / CALIBRATION_SAMPLES,
    };

    baselineGyro = {
      x: gyroSum.x / CALIBRATION_SAMPLES,
      y: gyroSum.y / CALIBRATION_SAMPLES,
      z: gyroSum.z / CALIBRATION_SAMPLES,
    };

    isCalibrated = true;
    console.log("Motion calibration completed:", { baselineAccel, baselineGyro });
  }

  return isCalibrated;
};

// 校正をリセット
export const resetCalibration = () => {
  isCalibrated = false;
  calibrationCount = 0;
  accelSum = { x: 0, y: 0, z: 0 };
  gyroSum = { x: 0, y: 0, z: 0 };
};

// モーション検出の有効/無効を切り替え
export const setMotionDetectionEnabled = (enabled: boolean) => {
  motionDetectionEnabled = enabled;
  console.log(`Motion detection ${enabled ? 'enabled' : 'disabled'}`);
};

export const isMotionDetectionEnabled = () => motionDetectionEnabled;

// 生データからモーションデータを抽出
export const extractMotionDataFromBuffer = (buffer: ArrayBufferLike): MotionData => {
  const dataView = new DataView(buffer);

  // バッファサイズの確認とデバッグ
  console.log("Buffer length:", buffer.byteLength);
  if (buffer.byteLength < 24) {
    console.log("Buffer too small for motion data");
    return {
      accelerometer: { x: 0, y: 0, z: 0 },
      gyroscope: { x: 0, y: 0, z: 0 },
    };
  }

  // バッファの内容をデバッグ表示（全バイト）
  const debugArray = new Uint8Array(buffer);
  console.log("Buffer content:", Array.from(debugArray).map(b => b.toString(16).padStart(2, '0')).join(' '));

  let accelX = 0, accelY = 0, accelZ = 0;
  let gyroX = 0, gyroY = 0, gyroZ = 0;

  try {
    // 48バイトバッファでの安全なIMUデータ読み取り
    // Joy-Conのレポート0x30での実際のIMU位置を確認

    // 位置1: オフセット13から（標準的な位置）- 6バイト必要（13-18）
    if (buffer.byteLength >= 24) {
      const accelX1 = dataView.getInt16(13, true);
      const accelY1 = dataView.getInt16(15, true);
      const accelZ1 = dataView.getInt16(17, true);
      const gyroX1 = dataView.getInt16(19, true);
      const gyroY1 = dataView.getInt16(21, true);
      const gyroZ1 = dataView.getInt16(23, true);
      console.log("IMU Sample 1 (offset 13):", { accelX: accelX1, accelY: accelY1, accelZ: accelZ1, gyroX: gyroX1, gyroY: gyroY1, gyroZ: gyroZ1 });

      if (accelX1 !== 0 || accelY1 !== 0 || accelZ1 !== 0 || gyroX1 !== 0 || gyroY1 !== 0 || gyroZ1 !== 0) {
        accelX = accelX1; accelY = accelY1; accelZ = accelZ1;
        gyroX = gyroX1; gyroY = gyroY1; gyroZ = gyroZ1;
        console.log("Using sample 1 (offset 13)");
      }
    }

    // 位置2: オフセット25から（別のサンプル位置）- 12バイト必要（25-36）
    if (buffer.byteLength >= 36 && accelX === 0 && accelY === 0 && accelZ === 0) {
      const accelX2 = dataView.getInt16(25, true);
      const accelY2 = dataView.getInt16(27, true);
      const accelZ2 = dataView.getInt16(29, true);
      const gyroX2 = dataView.getInt16(31, true);
      const gyroY2 = dataView.getInt16(33, true);
      const gyroZ2 = dataView.getInt16(35, true);
      console.log("IMU Sample 2 (offset 25):", { accelX: accelX2, accelY: accelY2, accelZ: accelZ2, gyroX: gyroX2, gyroY: gyroY2, gyroZ: gyroZ2 });

      if (accelX2 !== 0 || accelY2 !== 0 || accelZ2 !== 0 || gyroX2 !== 0 || gyroY2 !== 0 || gyroZ2 !== 0) {
        accelX = accelX2; accelY = accelY2; accelZ = accelZ2;
        gyroX = gyroX2; gyroY = gyroY2; gyroZ = gyroZ2;
        console.log("Using sample 2 (offset 25)");
      }
    }

    // 位置3: オフセット37から（さらに別のサンプル位置）- 12バイト必要（37-48）
    if (buffer.byteLength >= 48 && accelX === 0 && accelY === 0 && accelZ === 0) {
      const accelX3 = dataView.getInt16(37, true);
      const accelY3 = dataView.getInt16(39, true);
      const accelZ3 = dataView.getInt16(41, true);
      const gyroX3 = dataView.getInt16(43, true);
      const gyroY3 = dataView.getInt16(45, true);
      const gyroZ3 = dataView.getInt16(47, true);
      console.log("IMU Sample 3 (offset 37):", { accelX: accelX3, accelY: accelY3, accelZ: accelZ3, gyroX: gyroX3, gyroY: gyroY3, gyroZ: gyroZ3 });

      if (accelX3 !== 0 || accelY3 !== 0 || accelZ3 !== 0 || gyroX3 !== 0 || gyroY3 !== 0 || gyroZ3 !== 0) {
        accelX = accelX3; accelY = accelY3; accelZ = accelZ3;
        gyroX = gyroX3; gyroY = gyroY3; gyroZ = gyroZ3;
        console.log("Using sample 3 (offset 37)");
      }
    }

    if (accelX === 0 && accelY === 0 && accelZ === 0 && gyroX === 0 && gyroY === 0 && gyroZ === 0) {
      console.log("All IMU samples are zero or not found");
    }

  } catch (error) {
    console.error("Error reading IMU data:", error);
    return {
      accelerometer: { x: 0, y: 0, z: 0 },
      gyroscope: { x: 0, y: 0, z: 0 },
    };
  }

  const result = {
    accelerometer: {
      x: accelX / 4096, // 正規化 (-2g to +2g range)
      y: accelY / 4096,
      z: accelZ / 4096,
    },
    gyroscope: {
      x: gyroX / 16.4, // 正規化 (degrees per second)
      y: gyroY / 16.4,
      z: gyroZ / 16.4,
    },
  };

  console.log("Final motion data:", result);
  return result;
};

// モーションデータから傾きコマンドを判定（バランスの取れた判定）
export const analyzeTiltCommand = (
  motionData: MotionData,
  accelThreshold = 0.4, // 適度な加速度閾値
  gyroThreshold = 80    // 適度なジャイロ閾値
): TiltCommand | null => {
  // モーション検出が無効の場合は即座にnullを返す
  if (!motionDetectionEnabled) {
    return null;
  }

  // 校正が完了していない場合は入力を受け付けない
  if (!isCalibrated) {
    calibrateMotion(motionData);
    return null;
  }

  const { accelerometer, gyroscope } = motionData;

  // データが無効な場合（全て0や異常な値）は無視
  if (
    (accelerometer.x === 0 && accelerometer.y === 0 && accelerometer.z === 0) ||
    (gyroscope.x === 0 && gyroscope.y === 0 && gyroscope.z === 0) ||
    Math.abs(accelerometer.x) > 10 || Math.abs(accelerometer.y) > 10 || Math.abs(accelerometer.z) > 10 ||
    Math.abs(gyroscope.x) > 2000 || Math.abs(gyroscope.y) > 2000 || Math.abs(gyroscope.z) > 2000
  ) {
    return null;
  }

  // 基準値からの差分を計算
  const accelDiff = {
    x: accelerometer.x - baselineAccel.x,
    y: accelerometer.y - baselineAccel.y,
    z: accelerometer.z - baselineAccel.z,
  };

  const gyroDiff = {
    x: gyroscope.x - baselineGyro.x,
    y: gyroscope.y - baselineGyro.y,
    z: gyroscope.z - baselineGyro.z,
  };

  // 傾きの強度計算（基準値からの差分を使用）
  const leftRightTilt = Math.abs(accelDiff.x);
  const upDownTilt = Math.abs(accelDiff.y);
  const forwardBackwardTilt = Math.abs(accelDiff.z);

  // ジャイロスコープでの回転検出（基準値からの差分）
  const rotationIntensity = Math.sqrt(
    gyroDiff.x ** 2 + gyroDiff.y ** 2 + gyroDiff.z ** 2
  );

  let direction = TiltDirection.NONE;
  let intensity = 0;
  let detectionMethod = "";

  // 加速度ベースの傾き検出（適度な閾値）
  if (leftRightTilt > accelThreshold) {
    direction = accelDiff.x > 0 ? TiltDirection.RIGHT : TiltDirection.LEFT;
    intensity = Math.min(leftRightTilt, 1);
    detectionMethod = "accel-lr";
  } else if (upDownTilt > accelThreshold) {
    direction = accelDiff.y > 0 ? TiltDirection.UP : TiltDirection.DOWN;
    intensity = Math.min(upDownTilt, 1);
    detectionMethod = "accel-ud";
  } else if (forwardBackwardTilt > accelThreshold) {
    direction = accelDiff.z > 0 ? TiltDirection.FORWARD : TiltDirection.BACKWARD;
    intensity = Math.min(forwardBackwardTilt, 1);
    detectionMethod = "accel-fb";
  }

  // ジャイロスコープベースの回転検出（適度な感度）
  if (rotationIntensity > gyroThreshold) {
    const dominantAxis = Math.abs(gyroDiff.x) > Math.abs(gyroDiff.y)
      ? (Math.abs(gyroDiff.x) > Math.abs(gyroDiff.z) ? 'x' : 'z')
      : (Math.abs(gyroDiff.y) > Math.abs(gyroDiff.z) ? 'y' : 'z');

    switch (dominantAxis) {
      case 'x':
        direction = gyroDiff.x > 0 ? TiltDirection.UP : TiltDirection.DOWN;
        detectionMethod = "gyro-x";
        break;
      case 'y':
        direction = gyroDiff.y > 0 ? TiltDirection.LEFT : TiltDirection.RIGHT;
        detectionMethod = "gyro-y";
        break;
      case 'z':
        direction = gyroDiff.z > 0 ? TiltDirection.FORWARD : TiltDirection.BACKWARD;
        detectionMethod = "gyro-z";
        break;
    }
    intensity = Math.min(rotationIntensity / 200, 1); // 適度な正規化
  }

  // 適度な最小強度閾値
  if (direction === TiltDirection.NONE || intensity < 0.2) {
    return null;
  }

  console.log(`Motion detected: ${tiltDirectionToString(direction)} (${detectionMethod}) intensity: ${intensity.toFixed(2)}`);

  return {
    direction,
    intensity,
    timestamp: Date.now(),
  };
};

// コマンド種別を数値に変換（既存のaddNode関数と互換性を保つため）
export const tiltDirectionToInputNumber = (direction: TiltDirection): number => {
  switch (direction) {
    case TiltDirection.LEFT:
      return 3;
    case TiltDirection.RIGHT:
      return 4;
    case TiltDirection.UP:
      return 5;
    case TiltDirection.DOWN:
      return 6;
    case TiltDirection.FORWARD:
      return 7;
    case TiltDirection.BACKWARD:
      return 8;
    default:
      return 0; // NONE
  }
};

// 校正状態を取得
export const getCalibrationStatus = () => ({
  isCalibrated,
  calibrationCount,
  progress: Math.min(calibrationCount / CALIBRATION_SAMPLES, 1),
  baselineAccel: isCalibrated ? baselineAccel : null,
  baselineGyro: isCalibrated ? baselineGyro : null,
  motionDetectionEnabled,
});

// デバッグ用：傾き方向を文字列に変換
export const tiltDirectionToString = (direction: TiltDirection): string => {
  switch (direction) {
    case TiltDirection.LEFT:
      return "左";
    case TiltDirection.RIGHT:
      return "右";
    case TiltDirection.UP:
      return "上";
    case TiltDirection.DOWN:
      return "下";
    case TiltDirection.FORWARD:
      return "前";
    case TiltDirection.BACKWARD:
      return "後";
    default:
      return "なし";
  }
};

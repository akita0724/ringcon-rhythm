const initialStickValue = {
  strain: 0,
  hor: 0,
  ver: 0,
  acc: { x: 0, y: 0, z: 0 },
  gyro: { x: 0, y: 0, z: 0 },
};

export const extractCommand = (data: typeof initialStickValue): number => {
  // ストレイン（圧力）による左右判定の定数
  const NEUTRAL_STRAIN = 3000;
  const NEUTRAL_STRAIN_RADIUS = 1000;
  const NEUTRAL_STRAIN_RADIUS_MARGIN = 200;

  // モーション判定のしきい値
  const MOTION_THRESHOLD = 0.5; // 加速度のしきい値
  const GYRO_THRESHOLD = 100; // ジャイロの しきい値

  const strain = data.strain;
  const { acc, gyro } = data;
  const baseValue = NEUTRAL_STRAIN;


  if (strain < baseValue - NEUTRAL_STRAIN_RADIUS) {
    return 1; // Left command (strain-based)
  } else if (strain > baseValue + NEUTRAL_STRAIN_RADIUS) {
    return 2; // Right command (strain-based)
  }

  // モーション（傾き）による方向判定を優先
  // 上方向：Y軸の加速度が正の方向に大きい、またはX軸のジャイロが負（後ろに傾ける）
  if (acc.y > MOTION_THRESHOLD || gyro.x < -GYRO_THRESHOLD) {
    return 3; // Up command
  }

  // 下方向：Y軸の加速度が負の方向に大きい、またはX軸のジャイロが正（前に傾ける）
  if (acc.y < -MOTION_THRESHOLD || gyro.x > GYRO_THRESHOLD) {
    return 4; // Down command
  }

  // 左方向：X軸の加速度が負の方向に大きい、またはZ軸のジャイロが正（左に傾ける）
  if (acc.x < -MOTION_THRESHOLD || gyro.z > GYRO_THRESHOLD) {
    return 1; // Left command
  }

  // 右方向：X軸の加速度が正の方向に大きい、またはZ軸のジャイロが負（右に傾ける）
  if (acc.x > MOTION_THRESHOLD || gyro.z < -GYRO_THRESHOLD) {
    return 2; // Right command
  }
  return 0; // Default to neutral
};

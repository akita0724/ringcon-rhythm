export interface MotionData {
  accelerometer: {
    x: number;
    y: number;
    z: number;
  };
  gyroscope: {
    x: number;
    y: number;
    z: number;
  };
}

export enum TiltDirection {
  NONE = 0,
  LEFT = 1,
  RIGHT = 2,
  UP = 3,
  DOWN = 4,
  FORWARD = 5,
  BACKWARD = 6,
}

export interface TiltCommand {
  direction: TiltDirection;
  intensity: number; // 0-1の範囲
  timestamp: number;
}

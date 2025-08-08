import { Node } from "@/types/node";
import { MotionData, TiltCommand } from "@/types/motion";
import { atom } from "jotai";

const isStartedAtom = atom<boolean>(false);
const turnAtom = atom<number>(0);

const turnStartTimeAtom = atom<Date | null>(null);

const missCountAtom = atom<[number, number]>([0, 0]);
const currentNodeAtom = atom<number>(0);

// 初期ノードからの経過時間(ms)を管理する
const nodesAtom = atom<Node[]>([]);

const songInfoAtom = atom<{
  title: string;
  artist: string;
}>({
  title: "",
  artist: "",
});

const connectedAtom = atom<boolean>(false);
const isPlessedAtom = atom<boolean>(false);
const baseValueAtom = atom<number>(0);
const gameOverAtom = atom<boolean>(false);

// モーションデータ関連
const motionDataAtom = atom<MotionData>({
  accelerometer: { x: 0, y: 0, z: 0 },
  gyroscope: { x: 0, y: 0, z: 0 },
});
const lastTiltCommandAtom = atom<TiltCommand | null>(null);

export {
  isStartedAtom,
  turnAtom,
  songInfoAtom,
  missCountAtom,
  currentNodeAtom,
  nodesAtom,
  turnStartTimeAtom,
  connectedAtom,
  isPlessedAtom,
  baseValueAtom,
  gameOverAtom,
  motionDataAtom,
  lastTiltCommandAtom,
};

export const MissLimit = 100; // ミスの上限
export const playerNames = atom<[string, string]>(["Player 1", "Player 2"]);
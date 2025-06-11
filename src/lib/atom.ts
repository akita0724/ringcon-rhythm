import { atom } from "jotai";

const isStarted = atom<boolean>(false);
const turn = atom<number>(0);

const missCount = atom<number[]>([0, 0]);
const currentNode = atom<number>(0);

// 初期ノードからの経過時間(ms)を管理する
const nodes = atom<number[]>([]);

const songInfo = atom<{
  title: string;
  artist: string;
}>({
  title: "",
  artist: "",
});

export {
  isStarted,
  turn,
  songInfo,
  missCount,
  currentNode,
  nodes,
};
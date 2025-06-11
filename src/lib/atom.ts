import { atom } from "jotai";

const isStartedAtom = atom<boolean>(false);
const turnAtom = atom<number>(0);

const missCountAtom = atom<number[]>([0, 0]);
const currentNodeAtom = atom<number>(0);

// 初期ノードからの経過時間(ms)を管理する
const nodesAtom = atom<number[]>([]);

const songInfoAtom = atom<{
  title: string;
  artist: string;
}>({
  title: "",
  artist: "",
});

export {
  isStartedAtom,
  turnAtom,
  songInfoAtom,
  missCountAtom,
  currentNodeAtom,
  nodesAtom,
};
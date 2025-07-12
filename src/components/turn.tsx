import { MissLimit } from "@/consts/constraints";
import { missCountAtom, turnAtom , nodesAtom } from "@/lib/atom";
import { useAtomValue } from "jotai";

export const RightTurn = () => {
  const turn = useAtomValue(turnAtom);
  const missCount = useAtomValue(missCountAtom);
  return (
    <div
      style={{ height: `${(1-missCount[1] / MissLimit) * 80}%` , backgroundColor: turn === 1 ? "#326bcd": "#CADBFE"}}
      className="flex flex-col items-center justify-center absolute right-0 bottom-0 w-1/3 z-20 border-t-8"
    />
  );
};

export const LeftTurn = () => {
  const turn = useAtomValue(turnAtom);
  const missCount = useAtomValue(missCountAtom);
  return (
    <div
      style={{ height: `${(1-missCount[0] / MissLimit) * 80}%` ,backgroundColor: turn === -1 ? "#f04c4c": "#FCA5A5"}}
      className="flex flex-col items-center justify-center absolute left-0 bottom-0 w-1/3 z-20 border-t-8"
    />
  );
};

export const Info = () => {
    const missCount = useAtomValue(missCountAtom)

    const nodes = useAtomValue(nodesAtom)
    
    const remainMissCount = [MissLimit-missCount[0], MissLimit-missCount[1]];


    
    return (
    <div className="flex flex-col items-center justify-center absolute top-0 left-0 h-full w-full   bg-opacity-50 z-10">
        <div className="w-1/3 h-full absolute top-0 left-1/3 bg-gray-500 bg-opacity-50 z-20" />
        <h1 className="text-4xl font-bold mb-4 absolute top-20 z-30 text-white">
            Lv.{nodes.length}
        </h1>
        <p className="text-6xl mb-2 justify-center text-center items-center z-30 absolute left-0 w-1/3 top-7 h-20">
            {remainMissCount[0] > 0 ? remainMissCount[0] : "GAMEOVER"}
        </p>
        <p  className="text-6xl mb-2 justify-center text-center items-center z-30 absolute right-0 w-1/3 top-7 h-20">
            {remainMissCount[1] > 0 ? remainMissCount[1] : "GAMEOVER"}
        </p>
    </div>
    )
}



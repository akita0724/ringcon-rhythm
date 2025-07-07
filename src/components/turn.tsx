import { missCountAtom, turnAtom , nodesAtom} from "@/lib/atom";
import { useAtomValue } from "jotai";

const MISS_LIMIT = 50; // ミスの上限


export const Right_Turn = () => {
  const turn = useAtomValue(turnAtom);
  const missCount = useAtomValue(missCountAtom);
  return (
    <div
      style={{ height: `${(1-missCount[1] / MISS_LIMIT) * 80}%` , backgroundColor: turn === 1 ? "#326bcd": "#CADBFE"}}
      className="flex flex-col items-center justify-center absolute right-0 bottom-0 w-1/3 z-20 border-t-8"
    />
  );
};

export const Left_Turn = () => {
  const turn = useAtomValue(turnAtom);
  const missCount = useAtomValue(missCountAtom);
  return (
    <div
      style={{ height: `${(1-missCount[0] / MISS_LIMIT) * 80}%` ,backgroundColor: turn === -1 ? "#f04c4c": "#FCA5A5"}}
      className="flex flex-col items-center justify-center absolute left-0 bottom-0 w-1/3 z-20 border-t-8"
    />
  );
};

export const Info = () => {
    const missCount = useAtomValue(missCountAtom)

    const nodes = useAtomValue(nodesAtom)

    const remainMissCount = [MISS_LIMIT-missCount[0], MISS_LIMIT-missCount[1]];

   /* const r = [Math.round(255 * (1-remainMissCount[0] / MISS_LIMIT)), Math.round(255 * (1-remainMissCount[1] / MISS_LIMIT))];
    const g = [Math.round((255 * (remainMissCount[0] / MISS_LIMIT)))*0.8, Math.round((255 * (remainMissCount[1] / MISS_LIMIT)))*0.8];
    const b = 0;
    const lifeColor = [`rgb(${r[0]}, ${g[0]}, ${b})`, `rgb(${r[1]}, ${g[1]}, ${b})`];*/

    const status = ["50", "50"];

    if (remainMissCount[0] > 0) {
      status[0] = `${remainMissCount[0]}`;
    }else {
      status[0] = "GAME OVER";
    }
    if (remainMissCount[1] > 0) {
      status[1] = `${remainMissCount[1]}`;
    }else {
      status[1] = "GAME OVER";
    }
    
    return (
    <div className="flex flex-col items-center justify-center absolute top-0 left-0 h-full w-full   bg-opacity-50 z-10">
        <div className="w-1/3 h-full absolute top-0 left-1/3 bg-gray-500 bg-opacity-50 z-20" />
        <h1 className="text-4xl font-bold mb-4 absolute top-20 z-30 text-white">
            Lv.{nodes.length}
        </h1>
        {/* <p className="text-4xl mb-2 absolute top-30 z-30 text-white">
            {nodes.length}
        </p> */}
        <p className="text-6xl mb-2 justify-center text-center items-center z-30 absolute left-0 w-1/3 top-7 h-20">
            {status[0]}
            </p>
        <p  className="text-6xl mb-2 justify-center text-center items-center z-30 absolute right-0 w-1/3 top-7 h-20">
            {status[1]}
        </p>
      
    </div>
    )
}

/*export const Line = () => {
  return (
    <div>
      <div 
          className="w-2 items-start justify-start absolute h-full left-1/3 bg-white text-left z-30"
        />
        <div 
          className="w-2 items-end justify-end absolute h-full right-1/3 bg-white text-right z-30"
        />
    </div>
  );
}*/


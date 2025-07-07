import { missCountAtom, nodesAtom } from "@/lib/atom"
import { useAtomValue } from "jotai"

/*export const Info = () => {
    const missCount = useAtomValue(missCountAtom)

    const nodes = useAtomValue(nodesAtom)

    return (
    <div className="flex flex-col items-center justify-center absolute top-0 left-1/3 h-full w-1/3 bg-gray-100 bg-opacity-50">
        <h1 className="text-2xl font-bold mb-4">
            現在のノード数
        </h1>
        <p className="text-lg mb-2">
            {nodes.length}
        </p>
        <h1 className="text-2xl font-bold mb-4">
            ミスの回数
        </h1>
        <p className="text-lg mb-2">
            左: {missCount[0]}
            </p>
        <p className="text-lg mb-2" >
            右: {missCount[1]}
        </p>
        <h1 className="text-2xl font-bold mb-4">
            ミス数の上限
        </h1>
        <p className="text-lg mb-2">
            ${MISS_LIMIT}$
        </p>
            
    </div>
    )
}*/
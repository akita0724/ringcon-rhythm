import { missCountAtom, nodesAtom } from "@/lib/atom"
import { useAtomValue } from "jotai"

export const Info = () => {
    const missCount = useAtomValue(missCountAtom)

    const nodes = useAtomValue(nodesAtom)

    return (
    <div className="flex flex-col items-center justify-center absolute top-0 left-0 h-full w-full bg-gray-100 bg-opacity-50">
        <h1>現在のノード数</h1>
        <p>{nodes.length}</p>
        <h1>ミスの回数</h1>
        <p>左: {missCount[0]}</p>
        <p>右: {missCount[1]}</p>
    </div>
    )
}
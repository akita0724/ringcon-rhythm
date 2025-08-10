import { nodesAtom ,currentNodeAtom } from "@/lib/atom"
import { useAtomValue } from "jotai"



export const FinishedNodes = () => {
    const nodes = useAtomValue(nodesAtom)
    const currentNode = useAtomValue(currentNodeAtom)
    return (
    <div className="flex flex-col items-center justify-center absolute top-0 left-0 h-full w-full text-white bg-opacity-50 z-20">
        <h1 className="text-4xl absolute-40">
            完了ノード数: {currentNode}/{nodes.length}
        </h1>
    </div>
    )
}




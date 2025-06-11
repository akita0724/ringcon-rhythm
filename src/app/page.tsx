"use client";

import { Right_Turn, Left_Turn } from "@/components/turn";
import { turnAtom } from "@/lib/atom";
import { useAtom } from "jotai";

export default function Home() {
  const [turn, setTurn] = useAtom(turnAtom);

  return (
    <div>
      <Right_Turn turn={turn} />
      <Left_Turn turn={turn} />
    </div>
  );
}

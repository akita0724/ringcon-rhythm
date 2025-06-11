"use client";

import { useEffect } from "react";
import { Right_Turn, Left_Turn } from "@/components/turn";
import { turnAtom } from "@/lib/atom";
import { useAtom } from "jotai";
import { handleKeyDown } from "@/lib/handleInput";

export default function Home() {
  const [turn, setTurn] = useAtom(turnAtom);

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [setTurn]);

  return (
    <div>
      <Right_Turn turn={turn} />
      <Left_Turn turn={turn} />
    </div>
  );
}

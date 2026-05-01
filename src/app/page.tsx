"use client";

import { useGameStore } from "@/store/gameStore";
import PreGame from "@/components/PreGame";
import MatchScreen from "@/components/MatchScreen";
import FlipScreen from "@/components/FlipScreen";

export default function Home() {
  const screen = useGameStore((s) => s.screen);
  const currentGame = useGameStore((s) => s.currentGame);

  if (screen === "flip") return <FlipScreen />;

  if (currentGame && currentGame.status !== "setup") {
    return <MatchScreen />;
  }

  return <PreGame />;
}

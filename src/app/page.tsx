"use client";

import { useEffect, useRef } from "react";
import { useGameStore } from "@/store/gameStore";
import PreGame from "@/components/PreGame";
import MatchScreen from "@/components/MatchScreen";
import FlipScreen from "@/components/FlipScreen";

const PULL_THRESHOLD = 70;

export default function Home() {
  const screen = useGameStore((s) => s.screen);

  const startY = useRef(0);
  const pulling = useRef(false);
  const pullDist = useRef(0);

  useEffect(() => {
    function onTouchStart(e: TouchEvent) {
      if (window.scrollY > 0) return;
      startY.current = e.touches[0].clientY;
      pulling.current = true;
      pullDist.current = 0;
    }

    function onTouchMove(e: TouchEvent) {
      if (!pulling.current) return;
      const dy = e.touches[0].clientY - startY.current;
      if (dy <= 5) return;
      e.preventDefault();
      pullDist.current = dy * 0.5;
    }

    function onTouchEnd() {
      if (!pulling.current) return;
      pulling.current = false;
      if (pullDist.current >= PULL_THRESHOLD) window.location.reload();
      pullDist.current = 0;
    }

    document.addEventListener("touchstart", onTouchStart, { passive: true });
    document.addEventListener("touchmove", onTouchMove, { passive: false });
    document.addEventListener("touchend", onTouchEnd, { passive: true });

    return () => {
      document.removeEventListener("touchstart", onTouchStart);
      document.removeEventListener("touchmove", onTouchMove);
      document.removeEventListener("touchend", onTouchEnd);
    };
  }, []);

  const currentGame = useGameStore((s) => s.currentGame);

  if (screen === "flip") return <FlipScreen />;

  if (currentGame && currentGame.status !== "setup") {
    return <MatchScreen />;
  }

  return <PreGame />;
}

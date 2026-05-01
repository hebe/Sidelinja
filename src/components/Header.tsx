"use client";

import { useGameStore } from "@/store/gameStore";

export default function Header() {
  const screen = useGameStore((s) => s.screen);
  const setScreen = useGameStore((s) => s.setScreen);

  function handleFlip() {
    if (screen === "flip") {
      setScreen("pregame");
    } else {
      setScreen("flip");
    }
  }

  return (
    <div className="header">
      <div className="header-title-row">
        <div className="header-rule" />
        <span className="header-title">Sidelinja</span>
        <div className="header-rule" />
      </div>
      <div className="header-bottom">
        <button
          className="flip-btn"
          onClick={handleFlip}
          aria-label="Bytt skjerm"
        >
          ↩
        </button>
      </div>
    </div>
  );
}

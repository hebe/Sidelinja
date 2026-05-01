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
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
            <line x1="4" y1="6" x2="20" y2="6" />
            <line x1="4" y1="12" x2="20" y2="12" />
            <line x1="4" y1="18" x2="20" y2="18" />
            <line x1="9" y1="4" x2="9" y2="8" />
            <line x1="15" y1="10" x2="15" y2="14" />
            <line x1="11" y1="16" x2="11" y2="20" />
          </svg>
        </button>
      </div>
    </div>
  );
}

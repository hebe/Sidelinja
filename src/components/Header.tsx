"use client";

import { useGameStore } from "@/store/gameStore";

interface HeaderProps {
  onEasterEgg?: () => void;
  onRules?: () => void;
}

export default function Header({ onEasterEgg, onRules }: HeaderProps = {}) {
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
        {onEasterEgg && (
          <button
            onClick={onEasterEgg}
            style={{
              position: "absolute",
              top: 4,
              left: 4,
              background: "none",
              border: "none",
              cursor: "pointer",
              fontSize: "1.4rem",
              lineHeight: 1,
              padding: 4,
            }}
            aria-label="Tidsfordriv"
          >
            🤹
          </button>
        )}
        {onRules && (
          <button
            onClick={onRules}
            style={{
              position: "absolute",
              top: 4,
              left: 44,
              background: "none",
              border: "none",
              cursor: "pointer",
              fontSize: "1.4rem",
              lineHeight: 1,
              padding: 4,
            }}
            aria-label="Fotballreglene"
          >
            🤔
          </button>
        )}
        <button
          className="flip-btn"
          onClick={handleFlip}
          aria-label="Bytt skjerm"
          style={{ position: "absolute", top: 4, right: 4 }}
        >
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <polyline points="9 17 4 12 9 7" />
            <path d="M4 12h11a5 5 0 0 0 0-10h-2" />
          </svg>
        </button>
      </div>
    </div>
  );
}

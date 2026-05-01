"use client";

import { useState } from "react";
import { useGameStore } from "@/store/gameStore";
import Header from "./Header";

function todayNorwegian(): string {
  const now = new Date();
  const days = [
    "søndag", "mandag", "tirsdag", "onsdag", "torsdag", "fredag", "lørdag",
  ];
  const months = [
    "januar", "februar", "mars", "april", "mai", "juni",
    "juli", "august", "september", "oktober", "november", "desember",
  ];
  return `${days[now.getDay()]} ${now.getDate()}. ${months[now.getMonth()]} ${now.getFullYear()}`;
}

function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

export default function PreGame() {
  const myTeamName = useGameStore((s) => s.myTeamName);
  const startGame = useGameStore((s) => s.startGame);

  const [homeTeam, setHomeTeam] = useState(myTeamName);
  const [awayTeam, setAwayTeam] = useState("");
  const [myTeamIsHome, setMyTeamIsHome] = useState(true);
  const [kickoffTime, setKickoffTime] = useState("18:00");
  const [halfDuration, setHalfDuration] = useState(35);
  const [numHalves, setNumHalves] = useState(2);

  function handleStart() {
    if (!awayTeam.trim()) return;
    startGame({
      homeTeam: myTeamIsHome ? homeTeam : awayTeam,
      awayTeam: myTeamIsHome ? awayTeam : homeTeam,
      myTeamIsHome,
      date: todayISO(),
      kickoffTime,
      halfDuration,
      numHalves,
    });
  }

  function clamp(val: number, min: number, max: number) {
    return Math.max(min, Math.min(max, val));
  }

  return (
    <div className="app-shell">
      <div style={{ padding: "0 16px" }}>
        <Header />
      </div>

      <div className="screen">
        {/* Date */}
        <div
          style={{
            textAlign: "center",
            fontSize: "1.15rem",
            fontWeight: 700,
            color: "var(--color-text-muted)",
            padding: "8px 0 16px",
            textTransform: "capitalize",
          }}
        >
          {todayNorwegian()}
        </div>

        {/* Mitt lag */}
        <div className="modal-section">
          <label className="field-label">Mitt lag</label>
          <input
            className="field-input"
            type="text"
            value={homeTeam}
            onChange={(e) => setHomeTeam(e.target.value)}
            placeholder="Lagnavn..."
            autoComplete="off"
          />
        </div>

        {/* Motstander */}
        <div className="modal-section">
          <label className="field-label">Motstander</label>
          <input
            className="field-input"
            type="text"
            value={awayTeam}
            onChange={(e) => setAwayTeam(e.target.value)}
            placeholder="Skriv inn lagnavn..."
            autoComplete="off"
          />
        </div>

        {/* Hjemme / Borte toggle */}
        <div className="modal-section">
          <div className="radio-group">
            <label className={`radio-option${myTeamIsHome ? " selected" : ""}`}>
              <input
                type="radio"
                name="venue"
                checked={myTeamIsHome}
                onChange={() => setMyTeamIsHome(true)}
              />
              ● Hjemme
            </label>
            <label className={`radio-option${!myTeamIsHome ? " selected" : ""}`}>
              <input
                type="radio"
                name="venue"
                checked={!myTeamIsHome}
                onChange={() => setMyTeamIsHome(false)}
              />
              ○ Borte
            </label>
          </div>
        </div>

        {/* Kampstart */}
        <div className="modal-section">
          <label className="field-label">Kampstart</label>
          <input
            className="field-input"
            type="time"
            value={kickoffTime}
            onChange={(e) => setKickoffTime(e.target.value)}
          />
        </div>

        {/* Kampvarighet */}
        <div className="modal-section">
          <label className="field-label">Kampvarighet</label>
          <div className="duration-row">
            {/* Num halves stepper */}
            <div className="stepper" style={{ flex: "0 0 auto", width: 130 }}>
              <button
                className="stepper-btn"
                onClick={() => setNumHalves(clamp(numHalves - 1, 1, 4))}
              >
                −
              </button>
              <span className="stepper-value">{numHalves}</span>
              <button
                className="stepper-btn"
                onClick={() => setNumHalves(clamp(numHalves + 1, 1, 4))}
              >
                +
              </button>
            </div>

            <span className="duration-x">×</span>

            {/* Half duration stepper */}
            <div className="stepper" style={{ flex: 1 }}>
              <button
                className="stepper-btn"
                onClick={() => setHalfDuration(clamp(halfDuration - 5, 5, 60))}
              >
                −
              </button>
              <span className="stepper-value">{halfDuration}</span>
              <button
                className="stepper-btn"
                onClick={() => setHalfDuration(clamp(halfDuration + 5, 5, 60))}
              >
                +
              </button>
              <span className="stepper-label">min</span>
            </div>
          </div>
        </div>

        <div style={{ minHeight: 16 }} />
      </div>

      {/* Sticky bottom button — always visible regardless of scroll position */}
      <div style={{ padding: "0 16px 16px", flexShrink: 0 }}>
        <button
          className="btn-primary"
          onClick={handleStart}
          disabled={!awayTeam.trim()}
          style={{ opacity: awayTeam.trim() ? 1 : 0.5 }}
        >
          Start kamp →
        </button>
      </div>
    </div>
  );
}

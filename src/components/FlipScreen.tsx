"use client";

import { useEffect, useState } from "react";
import { useGameStore } from "@/store/gameStore";
import Header from "./Header";

interface HistoryGame {
  id: string;
  home_team: string;
  away_team: string;
  home_score: number;
  away_score: number;
  date: string;
  status: string;
}

function formatHistoryDate(iso: string): string {
  if (!iso) return "";
  const d = new Date(iso);
  const months = [
    "jan", "feb", "mar", "apr", "mai", "jun",
    "jul", "aug", "sep", "okt", "nov", "des",
  ];
  return `${d.getDate()}. ${months[d.getMonth()]}`;
}

export default function FlipScreen() {
  const myTeamName = useGameStore((s) => s.myTeamName);
  const setMyTeamName = useGameStore((s) => s.setMyTeamName);
  const resetGame = useGameStore((s) => s.resetGame);
  const currentGame = useGameStore((s) => s.currentGame);

  const [history, setHistory] = useState<HistoryGame[]>([]);
  const [loading, setLoading] = useState(true);
  const [teamInput, setTeamInput] = useState(myTeamName);

  useEffect(() => {
    fetch("/api/games")
      .then((r) => r.json())
      .then((data) => setHistory(data.games ?? []))
      .catch(() => setHistory([]))
      .finally(() => setLoading(false));
  }, []);

  function handleTeamSave() {
    setMyTeamName(teamInput.trim() || myTeamName);
  }

  return (
    <div className="app-shell">
      <div style={{ padding: "0 16px" }}>
        <Header />
      </div>

      <div className="screen">
        {/* Mitt lag */}
        <div className="modal-section" style={{ marginTop: 12 }}>
          <label className="field-label">Mitt lag</label>
          <div style={{ display: "flex", gap: 8 }}>
            <input
              className="field-input"
              type="text"
              value={teamInput}
              onChange={(e) => setTeamInput(e.target.value)}
              onBlur={handleTeamSave}
              style={{ flex: 1 }}
            />
          </div>
        </div>

        {/* Active game notice */}
        {currentGame && currentGame.status !== "finished" && (
          <div style={{ marginBottom: 16 }}>
            <div
              style={{
                background: "var(--color-surface)",
                borderRadius: "var(--card-radius)",
                padding: "14px 16px",
                fontSize: "0.95rem",
                fontWeight: 600,
                border: "1.5px solid var(--color-border)",
              }}
            >
              <div style={{ color: "var(--color-text-muted)", marginBottom: 6, fontSize: "0.8rem", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                Aktiv kamp
              </div>
              {currentGame.homeTeam} – {currentGame.awayTeam}
              <button
                className="btn-ghost"
                style={{ display: "block", marginTop: 10, color: "var(--color-danger)", padding: 0 }}
                onClick={resetGame}
              >
                Avslutt og nullstill
              </button>
            </div>
          </div>
        )}

        {/* Historikk */}
        <div className="field-label" style={{ marginBottom: 10 }}>Historikk</div>

        {loading && (
          <div style={{ color: "var(--color-text-muted)", fontSize: "0.9rem", padding: "12px 0" }}>
            Laster...
          </div>
        )}

        {!loading && history.length === 0 && (
          <div style={{ color: "var(--color-text-muted)", fontSize: "0.9rem", padding: "12px 0" }}>
            Ingen kamper lagret ennå.
          </div>
        )}

        {history.map((g) => (
          <div key={g.id} className="history-item">
            <span className="history-date">{formatHistoryDate(g.date)}</span>
            <span className="history-teams">
              {g.home_team} – {g.away_team}
            </span>
            <span className="history-score">
              {g.home_score}–{g.away_score}
            </span>
          </div>
        ))}

        {/* Easter egg */}
        <div style={{ flex: 1, minHeight: 40 }} />
        <div
          style={{
            textAlign: "center",
            color: "rgba(255,255,255,0.2)",
            fontSize: "0.8rem",
            fontWeight: 500,
            padding: "8px 0 4px",
          }}
        >
          🎮 Drep tiden?
        </div>
      </div>
    </div>
  );
}

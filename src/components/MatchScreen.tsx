"use client";

import { useEffect, useState } from "react";
import {
  useGameStore,
  useScore,
  useCards,
  useClockText,
  useHalfLabel,
  useAdvanceLabel,
  type EventTeam,
} from "@/store/gameStore";
import Header from "./Header";
import MalModal from "./MalModal";
import HendelseModal from "./HendelseModal";
import EventLog from "./EventLog";
import { syncGameToNeon } from "@/lib/sync";

type ModalState =
  | { type: "mal"; team: EventTeam }
  | { type: "hendelse"; team: EventTeam }
  | null;

function CardBadges({ team, align }: { team: EventTeam; align: "left" | "right" }) {
  const { yellow, red } = useCards(team);
  const items: React.ReactNode[] = [];
  if (yellow > 0)
    items.push(
      <span key="y" className="card-chip">
        🟨×{yellow}
      </span>
    );
  if (red > 0)
    items.push(
      <span key="r" className="card-chip red">
        🟥×{red}
      </span>
    );

  if (items.length === 0) return <div className={`card-badge${align === "right" ? " right" : ""}`} />;

  return (
    <div className={`card-badge${align === "right" ? " right" : ""}`}>
      {items}
    </div>
  );
}

export default function MatchScreen() {
  const game = useGameStore((s) => s.currentGame);
  const toggleClock = useGameStore((s) => s.toggleClock);
  const advanceHalf = useGameStore((s) => s.advanceHalf);
  const clockDisplay = useGameStore((s) => s.clockDisplay);
  const setClockDisplay = useGameStore((s) => s.setClockDisplay);
  const tick = useGameStore((s) => s.tick);

  const score = useScore();
  const clockText = useClockText();
  const halfLabel = useHalfLabel();
  const advanceLabel = useAdvanceLabel();

  const [modal, setModal] = useState<ModalState>(null);
  const [clockModalOpen, setClockModalOpen] = useState(false);

  // Timer tick
  useEffect(() => {
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [tick]);

  // Sync to Neon when game finishes
  useEffect(() => {
    if (game?.status === "finished") {
      syncGameToNeon(game, useGameStore.getState().events);
    }
  }, [game?.status]); // eslint-disable-line react-hooks/exhaustive-deps

  // Retry sync on reconnect
  useEffect(() => {
    function onOnline() {
      const { currentGame, events } = useGameStore.getState();
      if (currentGame?.status === "finished") {
        syncGameToNeon(currentGame, events);
      }
    }
    window.addEventListener("online", onOnline);
    return () => window.removeEventListener("online", onOnline);
  }, []);

  if (!game) return null;

  const isActive =
    game.status === "first_half" || game.status === "second_half";
  const isFinished = game.status === "finished";

  return (
    <div className="app-shell">
      <div style={{ padding: "0 16px" }}>
        <Header />
      </div>

      <div className="screen-noscroll">
        {/* ── Clock section ──────────────────────────────────── */}
        <div className="clock-section">
          <span className="clock-half-label">{halfLabel}</span>

          {/* Clock + play/pause side by side; tap clock to open match-state sheet */}
          <div
            className="clock-row"
            onClick={() => !isFinished && setClockModalOpen(true)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === "Enter" && !isFinished && setClockModalOpen(true)}
            aria-label="Kampstatus"
          >
            <span className="clock-time">{clockText}</span>
            {isActive && (
              <button
                className="play-btn"
                onClick={(e) => { e.stopPropagation(); toggleClock(); }}
                aria-label={game.isRunning ? "Pause" : "Start"}
              >
                {game.isRunning ? "⏸" : "▶"}
              </button>
            )}
          </div>

          {/* spilt / igjen toggle */}
          {isActive && (
            <div className="clock-toggle-row">
              <button
                className={`clock-toggle-btn${clockDisplay === "spilt" ? " active" : ""}`}
                onClick={() => setClockDisplay("spilt")}
              >
                spilt
              </button>
              <button
                className={`clock-toggle-btn${clockDisplay === "igjen" ? " active" : ""}`}
                onClick={() => setClockDisplay("igjen")}
              >
                igjen
              </button>
            </div>
          )}

          {isFinished && (
            <div style={{ color: "var(--color-text-muted)", fontWeight: 700, fontSize: "0.95rem" }}>
              Kampen er over
            </div>
          )}
        </div>

        {/* ── Score + action section ─────────────────────────── */}
        <div className="score-section" style={{ padding: "0 0 8px" }}>
          {/* Score + team names */}
          <div className="score-header">
            <div className="score-display">
              {score.home}
              <span className="score-sep"> – </span>
              {score.away}
            </div>
            <div className="score-names-row">
              <div className="score-team-name">{game.homeTeam}</div>
              <div className="score-team-name right">{game.awayTeam}</div>
            </div>
          </div>

          {/* Card badges */}
          <div className="card-badges">
            <CardBadges team="home" align="left" />
            <CardBadges team="away" align="right" />
          </div>

          {/* Action buttons */}
          <div className="action-grid">
            {/* Home buttons */}
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <button
                className="action-btn action-btn-goal"
                onClick={() => setModal({ type: "mal", team: "home" })}
              >
                MÅL
              </button>
              <button
                className="action-btn action-btn-event"
                onClick={() => setModal({ type: "hendelse", team: "home" })}
              >
                Hendelse
              </button>
            </div>

            {/* Away buttons */}
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <button
                className="action-btn action-btn-goal"
                onClick={() => setModal({ type: "mal", team: "away" })}
              >
                MÅL
              </button>
              <button
                className="action-btn action-btn-event"
                onClick={() => setModal({ type: "hendelse", team: "away" })}
              >
                Hendelse
              </button>
            </div>
          </div>
        </div>

        {/* ── Event log ──────────────────────────────────────── */}
        <div style={{ flex: 1 }} />
        <EventLog />
      </div>

      {/* ── Clock modal (advance half / end game) ──────────── */}
      {clockModalOpen && (
        <>
          <div className="sheet-overlay" onClick={() => setClockModalOpen(false)} />
          <div className="bottom-sheet">
            <div className="sheet-header">
              <div className="sheet-handle" />
              <div className="sheet-title">{halfLabel}</div>
            </div>
            <div className="sheet-footer" style={{ borderTop: "none" }}>
              {advanceLabel && (
                <button
                  className="btn-primary"
                  onClick={() => { advanceHalf(); setClockModalOpen(false); }}
                >
                  {advanceLabel}
                </button>
              )}
            </div>
          </div>
        </>
      )}

      {/* ── Modals ─────────────────────────────────────────── */}
      {modal?.type === "mal" && (
        <MalModal team={modal.team} onClose={() => setModal(null)} />
      )}
      {modal?.type === "hendelse" && (
        <HendelseModal team={modal.team} onClose={() => setModal(null)} />
      )}
    </div>
  );
}

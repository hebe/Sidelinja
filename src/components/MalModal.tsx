"use client";

import { useState } from "react";
import { useGameStore, type EventTeam } from "@/store/gameStore";

interface Props {
  team: EventTeam;
  editEventId?: string;
  onClose: () => void;
}

function formatSecs(secs: number): string {
  const m = Math.floor(Math.max(0, secs) / 60);
  const s = Math.max(0, secs) % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export default function MalModal({ team, editEventId, onClose }: Props) {
  const game = useGameStore((s) => s.currentGame);
  const events = useGameStore((s) => s.events);
  const addEvent = useGameStore((s) => s.addEvent);
  const updateEvent = useGameStore((s) => s.updateEvent);
  const deleteEvent = useGameStore((s) => s.deleteEvent);
  const rawSecs = game?.timerSeconds ?? 0;

  const existingEvent = editEventId
    ? events.find((e) => e.id === editEventId)
    : undefined;

  const [adjustedSecs, setAdjustedSecs] = useState(
    existingEvent?.secondsRaw ?? rawSecs
  );
  const [playerNumber, setPlayerNumber] = useState<string>(
    existingEvent?.playerNumber ? String(existingEvent.playerNumber) : ""
  );
  const [isSelvmål, setIsSelvmål] = useState(existingEvent?.isSelvmål ?? false);

  if (!game) return null;

  const teamName = team === "home" ? game.homeTeam : game.awayTeam;
  const minute = Math.floor(adjustedSecs / 60);

  function handleRegister() {
    if (editEventId) {
      updateEvent(editEventId, {
        minute,
        secondsRaw: adjustedSecs,
        playerNumber: playerNumber ? parseInt(playerNumber) : undefined,
        isSelvmål,
      });
    } else {
      if (typeof navigator !== "undefined" && navigator.vibrate) {
        navigator.vibrate([50, 30, 80]);
      }
      addEvent({
        minute,
        secondsRaw: adjustedSecs,
        type: "GOAL",
        team,
        playerNumber: playerNumber ? parseInt(playerNumber) : undefined,
        isSelvmål,
      });
    }
    onClose();
  }

  function handleDelete() {
    if (editEventId) {
      deleteEvent(editEventId);
      onClose();
    }
  }

  return (
    <>
      <div className="sheet-overlay" onClick={onClose} />
      <div className="bottom-sheet">
        <div className="sheet-header">
          <div className="sheet-handle" />
          <div className="sheet-title">
            {editEventId ? "Rediger mål" : "Mål for"}
          </div>
          <div className="sheet-subtitle">
            {teamName} · {minute}&apos;
          </div>
        </div>

        <div className="sheet-body">
          {/* Tidspunkt */}
          <div className="modal-section">
            <label className="field-label">Tidspunkt</label>
            <div className="time-edit-row">
              <span className="time-edit-value">{formatSecs(adjustedSecs)}</span>
              <button
                className="time-adj-btn"
                onClick={() => setAdjustedSecs((s) => Math.max(0, s - 60))}
              >
                − 1 min
              </button>
              <button
                className="time-adj-btn"
                onClick={() => setAdjustedSecs((s) => s + 60)}
              >
                + 1 min
              </button>
            </div>
          </div>

          {/* Drakt nr. */}
          <div className="modal-section">
            <label className="field-label">
              {isSelvmål ? "Drakt nr. (valgfri)" : "Drakt nr."}
            </label>
            <input
              className="number-input"
              type="number"
              inputMode="numeric"
              min={1}
              max={99}
              placeholder="#"
              value={playerNumber}
              onChange={(e) => setPlayerNumber(e.target.value)}
            />
          </div>

          {/* Selvmål toggle */}
          <div className="modal-section">
            <div className="toggle-row">
              <span className="toggle-label">
                {isSelvmål ? "Selvmål av motstander" : "Selvmål"}
              </span>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={isSelvmål}
                  onChange={(e) => setIsSelvmål(e.target.checked)}
                />
                <div className="toggle-track">
                  <div className="toggle-thumb" />
                </div>
              </label>
            </div>
          </div>
        </div>

        <div className="sheet-footer">
          {editEventId && (
            <button
              className="btn-ghost"
              onClick={handleDelete}
              style={{ width: "100%", color: "var(--color-danger)", marginBottom: 10 }}
            >
              Slett hendelse
            </button>
          )}
          <button className="btn-primary" onClick={handleRegister}>
            {editEventId ? "Lagre endringer" : "Registrer mål"}
          </button>
        </div>
      </div>
    </>
  );
}

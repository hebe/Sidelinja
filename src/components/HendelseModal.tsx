"use client";

import { useState } from "react";
import {
  useGameStore,
  useCurrentMinute,
  usePlayerCards,
  type EventTeam,
  type EventType,
  type EventSubtype,
} from "@/store/gameStore";

interface Props {
  team: EventTeam;
  editEventId?: string;
  onClose: () => void;
}

type HendelseType = "STRAFFE" | "KORT" | "SKADE";

function formatSecs(secs: number): string {
  const m = Math.floor(Math.max(0, secs) / 60);
  const s = Math.max(0, secs) % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

function PlayerCardChecker({
  team,
  playerNumber,
}: {
  team: EventTeam;
  playerNumber: number | undefined;
}) {
  const num = playerNumber;
  const { yellows } = usePlayerCards(team, num ?? -1);
  if (!num || yellows === 0) return null;
  return (
    <div className="notice-banner">
      Spiller #{num} har allerede gult kort — registreres som rødt 🟥
    </div>
  );
}

export default function HendelseModal({ team, editEventId, onClose }: Props) {
  const game = useGameStore((s) => s.currentGame);
  const events = useGameStore((s) => s.events);
  const addEvent = useGameStore((s) => s.addEvent);
  const updateEvent = useGameStore((s) => s.updateEvent);
  const deleteEvent = useGameStore((s) => s.deleteEvent);
  const currentMinute = useCurrentMinute();
  const rawSecs = game?.timerSeconds ?? 0;

  const existingEvent = editEventId
    ? events.find((e) => e.id === editEventId)
    : undefined;

  function guessHendelseType(e: typeof existingEvent): HendelseType {
    if (!e) return "KORT";
    if (e.type === "PENALTY") return "STRAFFE";
    if (e.type === "INJURY") return "SKADE";
    return "KORT";
  }

  const [adjustedSecs, setAdjustedSecs] = useState(
    existingEvent?.secondsRaw ?? rawSecs
  );
  const [hendelseType, setHendelseType] = useState<HendelseType>(
    guessHendelseType(existingEvent)
  );
  const [playerNumber, setPlayerNumber] = useState<string>(
    existingEvent?.playerNumber ? String(existingEvent.playerNumber) : ""
  );

  if (!game) return null;

  const teamName = team === "home" ? game.homeTeam : game.awayTeam;
  const minute = Math.floor(adjustedSecs / 60);
  const parsedNumber = playerNumber ? parseInt(playerNumber) : undefined;

  const { yellows } = usePlayerCards(team, parsedNumber ?? -1);
  const wouldBeRed = hendelseType === "KORT" && parsedNumber && yellows > 0;

  function resolveEventType(): { type: EventType; subtype: EventSubtype | undefined } {
    switch (hendelseType) {
      case "STRAFFE":
        return { type: "PENALTY", subtype: "STRAFFE" };
      case "SKADE":
        return { type: "INJURY", subtype: "SKADE" };
      case "KORT":
        return {
          type: "CARD",
          subtype: wouldBeRed ? "RED" : "YELLOW",
        };
    }
  }

  function handleRegister() {
    const { type, subtype } = resolveEventType();
    if (editEventId) {
      updateEvent(editEventId, {
        minute,
        secondsRaw: adjustedSecs,
        type,
        subtype,
        playerNumber: parsedNumber,
      });
    } else {
      addEvent({
        minute,
        secondsRaw: adjustedSecs,
        type,
        subtype,
        team,
        playerNumber: parsedNumber,
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

  const _m = currentMinute; // keep linter happy

  const isNumberRequired = hendelseType !== "SKADE";

  return (
    <>
      <div className="sheet-overlay" onClick={onClose} />
      <div className="bottom-sheet">
        <div className="sheet-header">
          <div className="sheet-handle" />
          <div className="sheet-title">
            {editEventId ? "Rediger hendelse" : "Hendelse for"}
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

          {/* Type */}
          <div className="modal-section">
            <label className="field-label">Type</label>
            <div className="type-cards">
              {(["STRAFFE", "KORT", "SKADE"] as HendelseType[]).map((t) => (
                <button
                  key={t}
                  className={`type-card${hendelseType === t ? " selected" : ""}`}
                  onClick={() => setHendelseType(t)}
                >
                  <span className="type-icon">
                    {t === "STRAFFE" ? "⚽" : t === "KORT" ? "🟨" : "🤕"}
                  </span>
                  {t === "STRAFFE" ? "Straffe" : t === "KORT" ? "Kort" : "Skade"}
                </button>
              ))}
            </div>
          </div>

          {/* Drakt nr. */}
          <div className="modal-section">
            <label className="field-label">
              Drakt nr.{!isNumberRequired ? " (valgfri)" : ""}
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
            {hendelseType === "KORT" && parsedNumber && (
              <PlayerCardChecker team={team} playerNumber={parsedNumber} />
            )}
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
          <button
            className="btn-primary"
            onClick={handleRegister}
            disabled={isNumberRequired && !parsedNumber}
            style={{ opacity: isNumberRequired && !parsedNumber ? 0.5 : 1 }}
          >
            Registrer hendelse
          </button>
        </div>
      </div>
    </>
  );
}

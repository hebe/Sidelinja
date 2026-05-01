"use client";

import { useState } from "react";
import {
  useGameStore,
  eventIcon,
  eventLabel,
  type GameEvent,
  type EventTeam,
} from "@/store/gameStore";
import MalModal from "./MalModal";
import HendelseModal from "./HendelseModal";

interface EditState {
  eventId: string;
  modalType: "mal" | "hendelse";
  team: EventTeam;
}

function EventRowItem({
  event,
  game,
  onEdit,
}: {
  event: GameEvent;
  game: NonNullable<ReturnType<typeof useGameStore.getState>["currentGame"]>;
  onEdit: () => void;
}) {
  return (
    <div className="event-row" onClick={onEdit} style={{ cursor: "pointer" }}>
      <span className="event-minute">{event.minute}&apos;</span>
      <span className="event-icon">{eventIcon(event)}</span>
      <span className="event-team">{eventLabel(event, game)}</span>
    </div>
  );
}

export default function EventLog() {
  const game = useGameStore((s) => s.currentGame);
  const events = useGameStore((s) => s.events);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editState, setEditState] = useState<EditState | null>(null);

  if (!game) return null;

  const sorted = [...events].sort((a, b) => b.minute - a.minute);
  const preview = sorted.slice(0, 3);

  function openEdit(event: GameEvent) {
    const isGoal = event.type === "GOAL" || event.type === "PENALTY";
    setEditState({
      eventId: event.id,
      modalType: isGoal ? "mal" : "hendelse",
      team: event.team,
    });
    setDrawerOpen(false);
  }

  return (
    <>
      {/* Compact bar — always visible */}
      <div
        className="event-log-bar"
        onClick={() => setDrawerOpen(true)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === "Enter" && setDrawerOpen(true)}
      >
        <div className="event-log-handle" />
        {preview.length === 0 ? (
          <div
            style={{
              textAlign: "center",
              color: "var(--color-text-muted)",
              fontSize: "0.9rem",
              fontWeight: 600,
              paddingBottom: 4,
            }}
          >
            Ingen hendelser ennå
          </div>
        ) : (
          preview.map((e) => (
            <EventRowItem key={e.id} event={e} game={game} onEdit={() => openEdit(e)} />
          ))
        )}
      </div>

      {/* Full drawer */}
      {drawerOpen && (
        <>
          <div className="sheet-overlay" onClick={() => setDrawerOpen(false)} />
          <div className="bottom-sheet" style={{ maxHeight: "80vh" }}>
            <div className="sheet-header">
              <div className="sheet-handle" />
              <div className="sheet-title">Hendelseslogg</div>
              <div className="sheet-subtitle">{events.length} hendelser totalt</div>
            </div>
            <div className="sheet-body">
              {sorted.length === 0 ? (
                <div
                  style={{
                    color: "var(--color-text-muted)",
                    textAlign: "center",
                    padding: "24px 0",
                    fontWeight: 600,
                  }}
                >
                  Ingen hendelser registrert
                </div>
              ) : (
                sorted.map((e) => (
                  <EventRowItem key={e.id} event={e} game={game} onEdit={() => openEdit(e)} />
                ))
              )}
            </div>
          </div>
        </>
      )}

      {/* Edit modals */}
      {editState?.modalType === "mal" && (
        <MalModal
          team={editState.team}
          editEventId={editState.eventId}
          onClose={() => setEditState(null)}
        />
      )}
      {editState?.modalType === "hendelse" && (
        <HendelseModal
          team={editState.team}
          editEventId={editState.eventId}
          onClose={() => setEditState(null)}
        />
      )}
    </>
  );
}

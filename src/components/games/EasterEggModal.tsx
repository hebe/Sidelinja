"use client";

type Game = "hanoi" | "ttt" | "quiz";

interface Props {
  onClose: () => void;
  onSelectGame: (game: Game) => void;
}

const GAMES: { id: Game; icon: string; name: string; desc: string; available: boolean }[] = [
  { id: "hanoi", icon: "🗼", name: "Tårnene i Hanoi", desc: "Flytt ringene fra venstre til høyre tårn", available: true },
  { id: "ttt", icon: "✕", name: "Tripp-trapp-tresko", desc: "Tre på rad mot deg selv", available: false },
  { id: "quiz", icon: "❓", name: "Fotballquiz", desc: "Spørsmål om fotball (kommer snart)", available: false },
];

export default function EasterEggModal({ onClose, onSelectGame }: Props) {
  return (
    <>
      <div className="sheet-overlay" onClick={onClose} />
      <div className="bottom-sheet">
        <div className="sheet-header">
          <div className="sheet-handle" />
          <div className="sheet-title">🤹 Tidsfordriv</div>
          <div className="sheet-subtitle">Velg et spill</div>
        </div>

        <div className="sheet-body" style={{ paddingBottom: 24 }}>
          {GAMES.map((g) => (
            <button
              key={g.id}
              onClick={() => g.available && onSelectGame(g.id)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 16,
                width: "100%",
                background: "var(--color-surface)",
                border: "1.5px solid var(--color-border)",
                borderRadius: "var(--card-radius)",
                padding: "14px 16px",
                marginBottom: 12,
                color: "inherit",
                textAlign: "left",
                cursor: g.available ? "pointer" : "default",
                opacity: g.available ? 1 : 0.5,
              }}
            >
              <span style={{ fontSize: "1.8rem", lineHeight: 1, flexShrink: 0 }}>{g.icon}</span>
              <div>
                <div style={{ fontWeight: 600, fontSize: "1rem", marginBottom: 2 }}>{g.name}</div>
                <div style={{ color: "var(--color-text-muted)", fontSize: "0.85rem" }}>{g.desc}</div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </>
  );
}

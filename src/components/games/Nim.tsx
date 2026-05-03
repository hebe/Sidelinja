"use client";

import { useState, useEffect } from "react";

interface Props {
  onClose: () => void;
}

const PILE_OPTIONS = [9, 10, 12, 13, 15, 16, 18, 21];
const DEFAULT_PILE = 15;

type Phase = "human" | "computer" | "won" | "lost";

// Optimal computer strategy: always leave pile % 3 === 1 for the opponent.
// Losing positions are pile ≡ 1 (mod 3): 1, 4, 7, 10, 13 …
function optimalMove(pile: number): 1 | 2 {
  if (pile % 3 === 0) return 2; // leave pile-2 → pile ≡ 1 (mod 3)
  if (pile % 3 === 2) return 1; // leave pile-1 → pile ≡ 1 (mod 3)
  return 1;                      // already losing, just take 1
}

export default function Nim({ onClose }: Props) {
  const [startPile, setStartPile] = useState(DEFAULT_PILE);
  const [pile, setPile] = useState(DEFAULT_PILE);
  const [phase, setPhase] = useState<Phase>("human");
  const [message, setMessage] = useState("Din tur — ta 1 eller 2 perler.");

  function doReset(n?: number) {
    const size = n ?? startPile;
    if (n !== undefined) setStartPile(n);
    setPile(size);
    setPhase("human");
    setMessage("Din tur — ta 1 eller 2 perler.");
  }

  function humanTake(n: 1 | 2) {
    if (phase !== "human" || n > pile) return;
    const next = pile - n;
    setPile(next);
    if (next === 0) {
      setPhase("lost");
    } else {
      setMessage(`Du tok ${n}. Datamaskinen tenker…`);
      setPhase("computer");
    }
  }

  useEffect(() => {
    if (phase !== "computer") return;
    const timer = setTimeout(() => {
      const taken = optimalMove(pile);
      const next = pile - taken;
      setPile(next);
      if (next === 0) {
        setPhase("won");
      } else {
        setMessage(`Datamaskinen tok ${taken}. Din tur.`);
        setPhase("human");
      }
    }, 750);
    return () => clearTimeout(timer);
  }, [phase]); // pile is captured correctly from the render that set phase="computer"

  const finished = phase === "won" || phase === "lost";

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "var(--color-bg-deep)",
        display: "flex",
        flexDirection: "column",
        zIndex: 200,
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "16px 20px 12px",
          paddingTop: "max(16px, env(safe-area-inset-top))",
          borderBottom: "1.5px solid var(--color-border)",
          flexShrink: 0,
        }}
      >
        <button
          onClick={onClose}
          style={{ background: "none", border: "none", color: "var(--color-text-muted)", fontSize: "1.5rem", cursor: "pointer", padding: "4px 8px", lineHeight: 1 }}
          aria-label="Lukk"
        >
          ✕
        </button>

        <div style={{ textAlign: "center" }}>
          <div style={{ fontWeight: 700, fontSize: "1.1rem" }}>Nim</div>
          <div style={{ color: "var(--color-text-muted)", fontSize: "0.8rem", marginTop: 2 }}>
            Ta 1 eller 2 — ikke ta den siste
          </div>
        </div>

        <div style={{ background: "var(--color-surface)", borderRadius: 10, padding: "4px 12px", textAlign: "center", minWidth: 44 }}>
          <div style={{ fontSize: "0.6rem", color: "var(--color-text-muted)", textTransform: "uppercase", letterSpacing: "0.06em" }}>Igjen</div>
          <div style={{ fontWeight: 700, fontSize: "1.1rem", fontVariantNumeric: "tabular-nums" }}>{pile}</div>
        </div>
      </div>

      {/* Bead grid */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 28,
          padding: "24px 20px",
        }}
      >
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: 8,
            justifyContent: "center",
            maxWidth: 5 * 44 + 4 * 8,
          }}
        >
          {Array.from({ length: startPile }).map((_, i) => {
            const active = i < pile;
            const isTop = active && i === pile - 1; // the "last" bead

            return (
              <div
                key={i}
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: "50%",
                  background: active
                    ? pile === 1 && phase === "human"
                      ? "var(--color-danger)"        // last bead glows red on human's turn
                      : "var(--color-accent-interactive)"
                    : "transparent",
                  border: active ? "none" : "1.5px solid var(--color-border)",
                  transition: "background 0.25s, border 0.25s",
                  flexShrink: 0,
                }}
              />
            );
          })}
        </div>

        {/* Status */}
        <div
          style={{
            color: "var(--color-text-muted)",
            fontSize: "0.9rem",
            textAlign: "center",
            minHeight: 20,
          }}
        >
          {!finished && message}
        </div>
      </div>

      {/* Footer controls */}
      <div
        style={{
          padding: "16px 20px",
          paddingBottom: "max(16px, env(safe-area-inset-bottom))",
          borderTop: "1.5px solid var(--color-border)",
          display: "flex",
          flexDirection: "column",
          gap: 12,
          flexShrink: 0,
        }}
      >
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <button
            onClick={() => humanTake(1)}
            disabled={phase !== "human"}
            className="btn-primary"
            style={{ opacity: phase !== "human" ? 0.45 : 1, transition: "opacity 0.2s" }}
          >
            Ta 1
          </button>
          <button
            onClick={() => humanTake(2)}
            disabled={phase !== "human" || pile < 2}
            className="btn-primary"
            style={{ opacity: (phase !== "human" || pile < 2) ? 0.45 : 1, transition: "opacity 0.2s" }}
          >
            Ta 2
          </button>
          <button onClick={() => doReset()} className="btn-secondary">
            ↺ Nullstill
          </button>
          <select
            value={startPile}
            onChange={(e) => doReset(Number(e.target.value))}
            className="field-input"
            style={{ fontSize: "var(--font-size-btn)", textAlign: "center", fontWeight: 600 }}
          >
            {PILE_OPTIONS.map((n) => (
              <option key={n} value={n}>{n} perler</option>
            ))}
          </select>
        </div>
      </div>

      {/* Win / lose overlay */}
      {finished && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "rgba(0,0,0,0.75)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 14,
            zIndex: 10,
          }}
        >
          <div style={{ fontSize: "3rem" }}>{phase === "won" ? "🎉" : "😬"}</div>
          <div style={{ fontWeight: 800, fontSize: "1.5rem" }}>
            {phase === "won" ? "Du vant!" : "Du tapte!"}
          </div>
          <div style={{ color: "var(--color-text-muted)", fontSize: "0.95rem", textAlign: "center", maxWidth: 260 }}>
            {phase === "won"
              ? "Datamaskinen tok den siste perlen."
              : "Du tok den siste perlen."}
          </div>
          <button
            onClick={() => doReset()}
            className="btn-primary"
            style={{ width: "auto", padding: "0 40px", marginTop: 8 }}
          >
            Spill igjen
          </button>
          <button onClick={onClose} className="btn-ghost" style={{ color: "var(--color-text-muted)" }}>
            Lukk
          </button>
        </div>
      )}
    </div>
  );
}

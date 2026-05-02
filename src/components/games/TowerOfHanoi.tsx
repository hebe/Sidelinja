"use client";

import { useState, useCallback } from "react";

interface Props {
  onClose: () => void;
}

function buildInitial(n: number): number[][] {
  const disks = Array.from({ length: n }, (_, i) => i + 1);
  return [disks, [], []];
}

function diskColor(size: number, total: number): string {
  const t = (size - 1) / Math.max(total - 1, 1);
  // Interpolate lightness from 0.72 (lightest/smallest) to 0.44 (darkest/largest)
  const l = 0.72 - t * 0.28;
  const c = 0.13 + t * 0.08;
  return `oklch(${l.toFixed(2)} ${c.toFixed(2)} 265)`;
}

const TOWER_LABELS = ["Tårn 1", "Tårn 2", "Tårn 3"];

export default function TowerOfHanoi({ onClose }: Props) {
  const [numDisks, setNumDisks] = useState(3);
  const [towers, setTowers] = useState<number[][]>(() => buildInitial(3));
  const [selected, setSelected] = useState<number | null>(null);
  const [moves, setMoves] = useState(0);
  const [shake, setShake] = useState<number | null>(null);
  const [won, setWon] = useState(false);

  const optimal = Math.pow(2, numDisks) - 1;

  const reset = useCallback((n: number) => {
    setTowers(buildInitial(n));
    setSelected(null);
    setMoves(0);
    setWon(false);
    setShake(null);
  }, []);

  function handleDiskChange(n: number) {
    setNumDisks(n);
    reset(n);
  }

  function handleTowerClick(towerIdx: number) {
    if (won) return;

    if (selected === null) {
      if (towers[towerIdx].length === 0) return;
      setSelected(towerIdx);
      return;
    }

    if (selected === towerIdx) {
      setSelected(null);
      return;
    }

    const topDisk = towers[selected][0];
    const targetTop = towers[towerIdx][0];

    if (targetTop !== undefined && targetTop < topDisk) {
      // Invalid move
      setShake(towerIdx);
      setTimeout(() => setShake(null), 400);
      setSelected(null);
      return;
    }

    const next = towers.map((t) => [...t]);
    next[selected].shift();
    next[towerIdx].unshift(topDisk);

    setTowers(next);
    setSelected(null);
    const newMoves = moves + 1;
    setMoves(newMoves);

    if (next[2].length === numDisks) {
      setWon(true);
    }
  }

  const maxDisks = Math.max(...towers.map((t) => t.length), numDisks);

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
          borderBottom: "1.5px solid var(--color-border)",
          flexShrink: 0,
        }}
      >
        <button
          onClick={onClose}
          style={{
            background: "none",
            border: "none",
            color: "var(--color-text-muted)",
            fontSize: "1.5rem",
            cursor: "pointer",
            padding: "4px 8px",
            lineHeight: 1,
          }}
          aria-label="Lukk"
        >
          ✕
        </button>

        <div style={{ textAlign: "center" }}>
          <div style={{ fontWeight: 700, fontSize: "1.1rem" }}>Tårnene i Hanoi</div>
          <div style={{ color: "var(--color-text-muted)", fontSize: "0.8rem", marginTop: 2 }}>
            Flytt alle ringene til høyre tårn
          </div>
        </div>

        {/* Counters */}
        <div style={{ display: "flex", gap: 8 }}>
          <div
            style={{
              background: "var(--color-surface)",
              borderRadius: 10,
              padding: "4px 10px",
              textAlign: "center",
              minWidth: 48,
            }}
          >
            <div style={{ fontSize: "0.65rem", color: "var(--color-text-muted)", textTransform: "uppercase", letterSpacing: "0.06em" }}>
              Trekk
            </div>
            <div style={{ fontWeight: 700, fontSize: "1.1rem", fontVariantNumeric: "tabular-nums" }}>{moves}</div>
          </div>
          <div
            style={{
              background: "var(--color-surface)",
              borderRadius: 10,
              padding: "4px 10px",
              textAlign: "center",
              minWidth: 48,
            }}
          >
            <div style={{ fontSize: "0.65rem", color: "var(--color-text-muted)", textTransform: "uppercase", letterSpacing: "0.06em" }}>
              Optimalt
            </div>
            <div
              style={{
                fontWeight: 700,
                fontSize: "1.1rem",
                fontVariantNumeric: "tabular-nums",
                color: "var(--color-accent-interactive)",
              }}
            >
              {optimal}
            </div>
          </div>
        </div>
      </div>

      {/* Game area */}
      <div
        style={{
          flex: 1,
          display: "flex",
          alignItems: "flex-end",
          justifyContent: "center",
          gap: 12,
          padding: "20px 16px 0",
          overflow: "hidden",
        }}
      >
        {towers.map((tower, tIdx) => {
          const isSelected = selected === tIdx;
          const isShaking = shake === tIdx;
          const isEmpty = tower.length === 0;

          return (
            <div
              key={tIdx}
              onClick={() => handleTowerClick(tIdx)}
              style={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                cursor: won ? "default" : "pointer",
                userSelect: "none",
                animation: isShaking ? "hanoi-shake 0.4s ease" : undefined,
              }}
            >
              {/* Disk stack — render empty rows first so disks sit at the bottom */}
              <div
                style={{
                  width: "100%",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 4,
                  flexGrow: 1,
                  justifyContent: "flex-end",
                }}
              >
                {/* Pad with empty slots */}
                {Array.from({ length: maxDisks - tower.length }).map((_, i) => (
                  <div key={`empty-${i}`} style={{ height: 28 }} />
                ))}

                {tower.map((size, dIdx) => {
                  const isTop = dIdx === 0;
                  const isSelectedDisk = isSelected && isTop;
                  const widthPct = 30 + (size / numDisks) * 55;

                  return (
                    <div
                      key={size}
                      style={{
                        width: `${widthPct}%`,
                        height: 28,
                        borderRadius: 6,
                        background: diskColor(size, numDisks),
                        boxShadow: isSelectedDisk
                          ? "0 0 0 2.5px #fff, 0 0 12px rgba(255,255,255,0.3)"
                          : "0 2px 6px rgba(0,0,0,0.3)",
                        transition: "box-shadow 0.15s",
                        flexShrink: 0,
                      }}
                    />
                  );
                })}
              </div>

              {/* Peg */}
              <div
                style={{
                  width: 6,
                  height: isEmpty ? 20 : 0,
                  background: "var(--color-surface-raised)",
                  borderRadius: 3,
                }}
              />

              {/* Base */}
              <div
                style={{
                  width: "90%",
                  height: 6,
                  background: isSelected
                    ? "var(--color-accent-interactive)"
                    : "var(--color-surface-raised)",
                  borderRadius: 3,
                  marginTop: 4,
                  transition: "background 0.15s",
                }}
              />

              {/* Label */}
              <div
                style={{
                  marginTop: 8,
                  fontSize: "0.75rem",
                  color: "var(--color-text-muted)",
                  fontWeight: 500,
                }}
              >
                {TOWER_LABELS[tIdx]}
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div
        style={{
          padding: "16px 20px",
          borderTop: "1.5px solid var(--color-border)",
          display: "flex",
          gap: 12,
          flexShrink: 0,
        }}
      >
        <button
          onClick={() => reset(numDisks)}
          className="btn-secondary"
          style={{ flex: 1 }}
        >
          ↺ Nullstill
        </button>

        <select
          value={numDisks}
          onChange={(e) => handleDiskChange(Number(e.target.value))}
          className="field-input"
          style={{ flex: 1, fontSize: "var(--font-size-btn)", fontWeight: 600 }}
        >
          {[3, 4, 5, 6, 7, 8].map((n) => (
            <option key={n} value={n}>
              {n} ringer
            </option>
          ))}
        </select>
      </div>

      {/* Win overlay */}
      {won && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "rgba(0,0,0,0.7)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 16,
            zIndex: 10,
          }}
        >
          <div style={{ fontSize: "3rem" }}>🎉</div>
          <div style={{ fontWeight: 700, fontSize: "1.4rem" }}>Ferdig!</div>
          <div style={{ color: "var(--color-text-muted)", fontSize: "1rem" }}>
            {moves} trekk{moves === optimal ? " — perfekt!" : ` (optimalt: ${optimal})`}
          </div>
          <button
            onClick={() => reset(numDisks)}
            className="btn-primary"
            style={{ marginTop: 8, width: "auto", padding: "0 32px" }}
          >
            Spill igjen
          </button>
          <button
            onClick={onClose}
            className="btn-ghost"
            style={{ color: "var(--color-text-muted)" }}
          >
            Lukk
          </button>
        </div>
      )}

      <style>{`
        @keyframes hanoi-shake {
          0%, 100% { transform: translateX(0); }
          20%       { transform: translateX(-6px); }
          40%       { transform: translateX(6px); }
          60%       { transform: translateX(-4px); }
          80%       { transform: translateX(4px); }
        }
      `}</style>
    </div>
  );
}

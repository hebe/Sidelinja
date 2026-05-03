"use client";

import { useState, useMemo } from "react";
import { questions, type Category } from "@/data/quizQuestions";

interface Props {
  onClose: () => void;
}

const QUESTIONS_PER_ROUND = 10;

const CATEGORIES: { id: Category; label: string; icon: string; sub: string }[] = [
  { id: "soccer",     icon: "⚽", label: "Fotball",   sub: "Spørsmål om den vakre sporten" },
  { id: "geography",  icon: "🌍", label: "Geografi",  sub: "Steder, land og kontinenter" },
  { id: "popculture", icon: "🎬", label: "Pop 90/00s", sub: "Film, musikk og artister" },
];

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function Quiz({ onClose }: Props) {
  const [category, setCategory] = useState<Category | null>(null);
  const [round, setRound] = useState<number[]>([]);      // shuffled question indices
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answered, setAnswered] = useState<0 | 1 | 2 | null>(null);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);

  const pool = useMemo(
    () => questions.filter((q) => q.category === category),
    [category]
  );

  function startCategory(cat: Category) {
    const indices = shuffle(
      questions
        .map((_, i) => i)
        .filter((i) => questions[i].category === cat)
    ).slice(0, QUESTIONS_PER_ROUND);

    setCategory(cat);
    setRound(indices);
    setCurrentIdx(0);
    setAnswered(null);
    setScore(0);
    setFinished(false);
  }

  function handleAnswer(choice: 0 | 1 | 2) {
    if (answered !== null) return;
    const q = questions[round[currentIdx]];
    const correct = choice === q.correct;
    setAnswered(choice);
    if (correct) setScore((s) => s + 1);

    setTimeout(() => {
      if (currentIdx + 1 >= round.length) {
        setFinished(true);
      } else {
        setCurrentIdx((i) => i + 1);
        setAnswered(null);
      }
    }, 900);
  }

  function restart() {
    if (category) startCategory(category);
  }

  function backToCategories() {
    setCategory(null);
    setFinished(false);
    setAnswered(null);
  }

  const catMeta = CATEGORIES.find((c) => c.id === category);
  const q = category && round.length > 0 ? questions[round[currentIdx]] : null;

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
          onClick={category && !finished ? backToCategories : onClose}
          style={{
            background: "none",
            border: "none",
            color: "var(--color-text-muted)",
            fontSize: "1.5rem",
            cursor: "pointer",
            padding: "4px 8px",
            lineHeight: 1,
          }}
          aria-label="Tilbake"
        >
          {category && !finished ? "‹" : "✕"}
        </button>

        <div style={{ textAlign: "center" }}>
          <div style={{ fontWeight: 700, fontSize: "1.1rem" }}>
            {catMeta ? `${catMeta.icon} ${catMeta.label}` : "Quiz"}
          </div>
          {q && (
            <div style={{ color: "var(--color-text-muted)", fontSize: "0.8rem", marginTop: 2 }}>
              Spørsmål {currentIdx + 1} av {round.length}
            </div>
          )}
        </div>

        {/* Score badge (hidden on category picker) */}
        {category && !finished ? (
          <div
            style={{
              background: "var(--color-surface)",
              borderRadius: 10,
              padding: "4px 12px",
              textAlign: "center",
              minWidth: 44,
            }}
          >
            <div style={{ fontSize: "0.6rem", color: "var(--color-text-muted)", textTransform: "uppercase", letterSpacing: "0.06em" }}>
              Poeng
            </div>
            <div style={{ fontWeight: 700, fontSize: "1.1rem" }}>{score}</div>
          </div>
        ) : (
          <div style={{ width: 44 }} />
        )}
      </div>

      {/* ── Category picker ── */}
      {!category && (
        <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", padding: "20px 20px", gap: 14 }}>
          <div style={{ textAlign: "center", color: "var(--color-text-muted)", fontSize: "0.9rem", marginBottom: 8 }}>
            Velg kategori
          </div>
          {CATEGORIES.map((cat) => {
            const count = questions.filter((q) => q.category === cat.id).length;
            const disabled = count === 0;
            return (
              <button
                key={cat.id}
                onClick={() => !disabled && startCategory(cat.id)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 16,
                  background: "var(--color-surface)",
                  border: "1.5px solid var(--color-border)",
                  borderRadius: "var(--card-radius)",
                  padding: "16px 18px",
                  color: "inherit",
                  textAlign: "left",
                  cursor: disabled ? "default" : "pointer",
                  opacity: disabled ? 0.4 : 1,
                }}
              >
                <span style={{ fontSize: "2rem", lineHeight: 1, flexShrink: 0 }}>{cat.icon}</span>
                <div>
                  <div style={{ fontWeight: 700, fontSize: "1.05rem" }}>{cat.label}</div>
                  <div style={{ color: "var(--color-text-muted)", fontSize: "0.8rem", marginTop: 2 }}>
                    {disabled ? "Ingen spørsmål ennå" : cat.sub}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* ── Question ── */}
      {category && !finished && q && (
        <div style={{ flex: 1, display: "flex", flexDirection: "column", padding: "28px 20px 20px", paddingBottom: "max(20px, env(safe-area-inset-bottom))" }}>
          {/* Progress bar */}
          <div
            style={{
              height: 3,
              background: "var(--color-surface)",
              borderRadius: 2,
              marginBottom: 28,
              overflow: "hidden",
            }}
          >
            <div
              style={{
                height: "100%",
                width: `${((currentIdx) / round.length) * 100}%`,
                background: "var(--color-accent-interactive)",
                borderRadius: 2,
                transition: "width 0.3s",
              }}
            />
          </div>

          {/* Question text */}
          <div
            style={{
              fontWeight: 700,
              fontSize: "1.15rem",
              lineHeight: 1.4,
              marginBottom: 32,
              flex: 0,
            }}
          >
            {q.q}
          </div>

          {/* Answer buttons */}
          <div style={{ display: "flex", flexDirection: "column", gap: 12, flex: 1, justifyContent: "flex-end" }}>
            {q.options.map((opt, i) => {
              const idx = i as 0 | 1 | 2;
              const isCorrect = idx === q.correct;
              const isChosen = idx === answered;
              const revealed = answered !== null;

              let bg = "var(--color-surface)";
              let border = "var(--color-border)";
              let color = "var(--color-text)";

              if (revealed) {
                if (isCorrect) {
                  bg = "rgba(76, 219, 122, 0.2)";
                  border = "var(--color-success)";
                  color = "var(--color-success)";
                } else if (isChosen) {
                  bg = "rgba(232, 85, 85, 0.2)";
                  border = "var(--color-danger)";
                  color = "var(--color-danger)";
                }
              }

              return (
                <button
                  key={i}
                  onClick={() => handleAnswer(idx)}
                  style={{
                    background: bg,
                    border: `1.5px solid ${border}`,
                    borderRadius: "var(--btn-radius)",
                    color,
                    padding: "14px 18px",
                    fontSize: "1rem",
                    fontWeight: 600,
                    textAlign: "left",
                    cursor: revealed ? "default" : "pointer",
                    transition: "background 0.2s, border-color 0.2s, color 0.2s",
                  }}
                >
                  {opt}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Result ── */}
      {finished && (
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px",
            gap: 12,
            paddingBottom: "max(20px, env(safe-area-inset-bottom))",
          }}
        >
          <div style={{ fontSize: "3rem" }}>
            {score === round.length ? "🏆" : score >= round.length * 0.7 ? "🎉" : score >= round.length * 0.4 ? "👍" : "😬"}
          </div>
          <div style={{ fontWeight: 800, fontSize: "1.6rem" }}>
            {score} / {round.length}
          </div>
          <div style={{ color: "var(--color-text-muted)", fontSize: "0.95rem", textAlign: "center", marginBottom: 12 }}>
            {score === round.length
              ? "Perfekt! Du kan dette."
              : score >= round.length * 0.7
              ? "Bra jobbet!"
              : score >= round.length * 0.4
              ? "Ikke verst."
              : "Bedre lykke neste gang!"}
          </div>
          <button onClick={restart} className="btn-primary" style={{ width: "auto", padding: "0 40px" }}>
            Prøv igjen
          </button>
          <button onClick={backToCategories} className="btn-ghost" style={{ color: "var(--color-text-muted)", marginTop: 4 }}>
            Bytt kategori
          </button>
        </div>
      )}
    </div>
  );
}

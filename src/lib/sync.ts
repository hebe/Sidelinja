import type { CurrentGame, GameEvent } from "@/store/gameStore";

function computeScore(events: GameEvent[]) {
  let home = 0;
  let away = 0;
  for (const e of events) {
    if (e.type !== "GOAL" && e.type !== "PENALTY") continue;
    if (e.isSelvmål) {
      if (e.team === "home") away++;
      else home++;
    } else {
      if (e.team === "home") home++;
      else away++;
    }
  }
  return { home, away };
}

export async function syncGameToNeon(
  game: CurrentGame,
  events: GameEvent[]
): Promise<void> {
  const { home, away } = computeScore(events);
  try {
    await fetch("/api/games", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        game: {
          id: game.id,
          homeTeam: game.homeTeam,
          awayTeam: game.awayTeam,
          homeScore: home,
          awayScore: away,
          date: game.date,
          kickoffTime: game.kickoffTime,
          halfDuration: game.halfDuration,
          numHalves: game.numHalves,
          status: game.status,
        },
        events,
      }),
    });
  } catch {
    // Silently fail — app is fully offline-first; sync is best-effort
  }
}

import { NextRequest, NextResponse } from "next/server";
import sql, { ensureSchema } from "@/lib/db";

export async function GET() {
  try {
    await ensureSchema();
    const games = await sql`
      SELECT id, home_team, away_team, home_score, away_score, date, status
      FROM games
      ORDER BY created_at DESC
      LIMIT 50
    `;
    return NextResponse.json({ games });
  } catch (e) {
    console.error("GET /api/games error:", e);
    return NextResponse.json({ games: [] });
  }
}

export async function POST(req: NextRequest) {
  try {
    await ensureSchema();
    const body = await req.json();
    const { game, events } = body;

    await sql`
      INSERT INTO games (id, home_team, away_team, home_score, away_score,
                         date, kickoff_time, half_duration, num_halves, status)
      VALUES (
        ${game.id}, ${game.homeTeam}, ${game.awayTeam},
        ${game.homeScore}, ${game.awayScore},
        ${game.date}, ${game.kickoffTime}, ${game.halfDuration},
        ${game.numHalves}, ${game.status}
      )
      ON CONFLICT (id) DO UPDATE SET
        home_score = EXCLUDED.home_score,
        away_score = EXCLUDED.away_score,
        status = EXCLUDED.status
    `;

    if (events && events.length > 0) {
      for (const e of events) {
        await sql`
          INSERT INTO events (id, game_id, minute, type, team, player_number, subtype, is_selvmal)
          VALUES (
            ${e.id}, ${e.gameId}, ${e.minute}, ${e.type},
            ${e.team}, ${e.playerNumber ?? null},
            ${e.subtype ?? null}, ${e.isSelvmål ?? false}
          )
          ON CONFLICT (id) DO NOTHING
        `;
      }
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("POST /api/games error:", e);
    return NextResponse.json({ ok: false, error: String(e) }, { status: 500 });
  }
}

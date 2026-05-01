import { NextRequest, NextResponse } from "next/server";
import sql, { ensureSchema } from "@/lib/db";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await ensureSchema();
    const { id } = await params;
    const events = await sql`
      SELECT id, minute, type, team, player_number, subtype, is_selvmal
      FROM events
      WHERE game_id = ${id}
      ORDER BY minute ASC, created_at ASC
    `;
    return NextResponse.json({ events });
  } catch (e) {
    console.error("GET /api/games/[id] error:", e);
    return NextResponse.json({ events: [] });
  }
}

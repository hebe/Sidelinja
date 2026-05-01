import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL!);
export default sql;

export async function ensureSchema() {
  await sql`
    CREATE TABLE IF NOT EXISTS games (
      id TEXT PRIMARY KEY,
      home_team TEXT NOT NULL,
      away_team TEXT NOT NULL,
      home_score INTEGER NOT NULL DEFAULT 0,
      away_score INTEGER NOT NULL DEFAULT 0,
      date TEXT NOT NULL,
      kickoff_time TEXT,
      half_duration INTEGER NOT NULL DEFAULT 35,
      num_halves INTEGER NOT NULL DEFAULT 2,
      status TEXT NOT NULL DEFAULT 'finished',
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;
  await sql`
    CREATE TABLE IF NOT EXISTS events (
      id TEXT PRIMARY KEY,
      game_id TEXT NOT NULL REFERENCES games(id) ON DELETE CASCADE,
      minute INTEGER NOT NULL DEFAULT 0,
      type TEXT NOT NULL,
      team TEXT NOT NULL,
      player_number INTEGER,
      subtype TEXT,
      is_selvmal BOOLEAN NOT NULL DEFAULT FALSE,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;
}

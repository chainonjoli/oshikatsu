import { createClient, type Client, type InArgs } from "@libsql/client";
import fs from "node:fs";
import path from "node:path";

// 本番(Vercel等): DATABASE_URL(libsql://... の Turso URL)+ DATABASE_AUTH_TOKEN
// ローカル開発:   環境変数なしで web/data/app.db のファイルに保存
const SCHEMA = `
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  display_name TEXT NOT NULL,
  is_admin INTEGER NOT NULL DEFAULT 0,
  plan TEXT NOT NULL DEFAULT 'free',
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS sessions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id),
  expires_at TEXT NOT NULL,
  created_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_sessions_user ON sessions(user_id);

CREATE TABLE IF NOT EXISTS oshis (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id),
  genre TEXT NOT NULL DEFAULT 'idol',
  group_name TEXT NOT NULL,
  member_name TEXT NOT NULL,
  color TEXT NOT NULL DEFAULT '#E93D82',
  image_path TEXT,
  fan_since TEXT,
  memo TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_oshis_user ON oshis(user_id);

CREATE TABLE IF NOT EXISTS events (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id),
  oshi_id TEXT,
  title TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'other',
  date TEXT NOT NULL,
  open_time TEXT NOT NULL DEFAULT '',
  start_time TEXT NOT NULL DEFAULT '',
  venue TEXT NOT NULL DEFAULT '',
  seat TEXT NOT NULL DEFAULT '',
  ticket_status TEXT NOT NULL DEFAULT 'none',
  weather_memo TEXT NOT NULL DEFAULT '',
  friends_memo TEXT NOT NULL DEFAULT '',
  emergency_contact TEXT NOT NULL DEFAULT '',
  memo TEXT NOT NULL DEFAULT '',
  source_note TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_events_user_date ON events(user_id, date);

CREATE TABLE IF NOT EXISTS trips (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id),
  event_id TEXT UNIQUE,
  title TEXT NOT NULL,
  origin TEXT NOT NULL DEFAULT '',
  transport_type TEXT NOT NULL DEFAULT 'shinkansen',
  depart_time TEXT NOT NULL DEFAULT '',
  arrive_time TEXT NOT NULL DEFAULT '',
  return_memo TEXT NOT NULL DEFAULT '',
  hotel_name TEXT NOT NULL DEFAULT '',
  hotel_checkin TEXT NOT NULL DEFAULT '',
  hotel_checkout TEXT NOT NULL DEFAULT '',
  hotel_memo TEXT NOT NULL DEFAULT '',
  cost_transport INTEGER NOT NULL DEFAULT 0,
  cost_hotel INTEGER NOT NULL DEFAULT 0,
  cost_ticket INTEGER NOT NULL DEFAULT 0,
  cost_goods INTEGER NOT NULL DEFAULT 0,
  cost_food INTEGER NOT NULL DEFAULT 0,
  cost_other INTEGER NOT NULL DEFAULT 0,
  schedule_json TEXT NOT NULL DEFAULT '[]',
  memo TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_trips_user ON trips(user_id);

CREATE TABLE IF NOT EXISTS checklists (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id),
  event_id TEXT,
  title TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_checklists_user ON checklists(user_id);

CREATE TABLE IF NOT EXISTS checklist_items (
  id TEXT PRIMARY KEY,
  checklist_id TEXT NOT NULL REFERENCES checklists(id),
  name TEXT NOT NULL,
  checked INTEGER NOT NULL DEFAULT 0,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_checklist_items_list ON checklist_items(checklist_id);

CREATE TABLE IF NOT EXISTS affiliate_links (
  id TEXT PRIMARY KEY,
  label TEXT NOT NULL,
  url TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'other',
  description TEXT NOT NULL DEFAULT '',
  active INTEGER NOT NULL DEFAULT 1,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
`;

let client: Client | null = null;
let ready: Promise<void> | null = null;

function getClient(): Client {
  if (client) return client;
  const url = process.env.DATABASE_URL ?? process.env.TURSO_DATABASE_URL;
  const authToken = process.env.DATABASE_AUTH_TOKEN ?? process.env.TURSO_AUTH_TOKEN;
  if (url) {
    client = createClient({ url, authToken });
  } else {
    const dir = path.join(process.cwd(), "data");
    fs.mkdirSync(dir, { recursive: true });
    client = createClient({ url: `file:${path.join(dir, "app.db")}` });
  }
  return client;
}

async function getDb(): Promise<Client> {
  const c = getClient();
  if (!ready) ready = c.executeMultiple(SCHEMA);
  await ready;
  return c;
}

/** SELECT: 全行を返す */
export async function query<T>(sql: string, args: InArgs = []): Promise<T[]> {
  const c = await getDb();
  const rs = await c.execute({ sql, args });
  return rs.rows as unknown as T[];
}

/** SELECT: 先頭行または null */
export async function queryOne<T>(sql: string, args: InArgs = []): Promise<T | null> {
  const rows = await query<T>(sql, args);
  return rows[0] ?? null;
}

/** INSERT / UPDATE / DELETE: 影響行数を返す */
export async function run(sql: string, args: InArgs = []): Promise<number> {
  const c = await getDb();
  const rs = await c.execute({ sql, args });
  return rs.rowsAffected;
}

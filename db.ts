import * as SQLite from "expo-sqlite";

let dbPromise: Promise<SQLite.SQLiteDatabase> | null = null;

async function openAndInit(): Promise<SQLite.SQLiteDatabase> {
  const db = await SQLite.openDatabaseAsync("app.db");
  await db.execAsync(`
    PRAGMA journal_mode = WAL;
    CREATE TABLE IF NOT EXISTS events (
      id   TEXT PRIMARY KEY NOT NULL,
      title TEXT NOT NULL,
      iso   TEXT NOT NULL,
      unit  TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS meta (
      k TEXT PRIMARY KEY NOT NULL,
      v TEXT NOT NULL
    );
    INSERT OR IGNORE INTO meta (k, v) VALUES ('schema_version','1');
  `);
  return db;
}

export function getDB() {
  if (!dbPromise) dbPromise = openAndInit();
  return dbPromise;
}

export async function loadEvents() {
  const db = await getDB();
  return db.getAllAsync<{
    id: string;
    title: string;
    iso: string;
    unit: "days" | "hours";
  }>("SELECT id, title, iso, unit FROM events ORDER BY iso ASC;");
}

export async function insertEvent(e: {
  id: string;
  title: string;
  iso: string;
  unit: "days" | "hours";
}) {
  const db = await getDB();
  await db.runAsync(
    "INSERT INTO events (id, title, iso, unit) VALUES (?, ?, ?, ?);",
    e.id,
    e.title,
    e.iso,
    e.unit
  );
}

export async function deleteEvent(id: string) {
  const db = await getDB();
  await db.runAsync("DELETE FROM events WHERE id=?;", id);
}

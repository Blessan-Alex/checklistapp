import { mkdirSync } from "node:fs";
import { dirname } from "node:path";
import Database from "better-sqlite3";
import type { Case } from "@/lib/types";
import { getDatabasePath } from "@/lib/server/env";

let db: Database.Database | null = null;

function migrate(database: Database.Database): void {
  database.exec(`
    CREATE TABLE IF NOT EXISTS cases (
      id TEXT PRIMARY KEY,
      data_json TEXT NOT NULL,
      client_token TEXT,
      updated_at TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_cases_client_token ON cases(client_token);
  `);
}

export function getDb(): Database.Database {
  if (db) {
    return db;
  }
  const path = getDatabasePath();
  mkdirSync(dirname(path), { recursive: true });
  db = new Database(path);
  db.pragma("journal_mode = WAL");
  migrate(db);
  return db;
}

export function rowToCase(row: {
  data_json: string;
  client_token: string | null;
}): Case {
  const caseRecord = JSON.parse(row.data_json) as Case;
  if (row.client_token) {
    caseRecord.clientToken = row.client_token;
  }
  return caseRecord;
}

export function persistCase(database: Database.Database, caseRecord: Case): void {
  const updatedAt = caseRecord.updatedAt ?? new Date().toISOString();
  database
    .prepare(
      `INSERT INTO cases (id, data_json, client_token, updated_at)
       VALUES (@id, @data_json, @client_token, @updated_at)
       ON CONFLICT(id) DO UPDATE SET
         data_json = excluded.data_json,
         client_token = excluded.client_token,
         updated_at = excluded.updated_at`,
    )
    .run({
      id: caseRecord.id,
      data_json: JSON.stringify(caseRecord),
      client_token: caseRecord.clientToken ?? null,
      updated_at: updatedAt,
    });
}

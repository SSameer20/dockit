import sqlite3 from "sqlite3";
import { Log } from "./helper";

export async function connectDB() {
  const db = new sqlite3.Database(
    "./db.db",
    sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE,
    (error) => {
      if (error) {
        Log.error(`${error}`);
        return;
      }
      Log.info(`connecetd to database`);
      return;
    }
  );

  db.exec(`CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            email TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            role TEXT DEFAULT 'user',
            credits INTEGER DEFAULT 20
        )
    `);

  db.exec(`CREATE TABLE IF NOT EXISTS request (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      status TEXT DEFAULT 'pending',
      request_credits INTEGER DEFAULT 1,
      requestDate DATE DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) references users(id) ON DELETE CASCADE 
  )
`);

  db.exec(` CREATE TABLE IF NOT EXISTS documents (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  type TEXT NOT NULL,
  file_name TEXT DEFAULT 'UNKNOWN' NOT NULL,
  content TEXT,
  createdAT DATE DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) references users(id) ON DELETE CASCADE
)
`);

  db.exec(` CREATE TABLE IF NOT EXISTS user_requests (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  request TEXT,
  requestAt DATE DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) references users(id) ON DELETE CASCADE
)
`);

  db.exec(` CREATE TABLE IF NOT EXISTS documents (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  type TEXT NOT NULL,
  file_name TEXT DEFAULT 'UNKNOWN' NOT NULL,
  content TEXT,
  createdAT DATE DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) references users(id) ON DELETE CASCADE
)
`);

  return db;
}

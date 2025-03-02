import sqlite3 from "sqlite3";

export async function connectDB() {
  const db = new sqlite3.Database(
    "../database.db",
    sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE,
    (error) => {
      if (error) {
        console.log(`Error while connecting to database`);
      }
      console.log(`connecetd to database`);
    }
  );

  await db.exec(` CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            email TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL
        )
    `);

  await db.exec(` CREATE TABLE IF NOT EXISTS admin (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL
  )
`);

  return db;
}

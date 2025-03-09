import { Request, Response } from "express";
import { connectDB } from "../lib/db";
import fs from "fs";
import path from "path";
import {
  AuthenticatedRequest,
  EncryptText,
  ExtractDataFromPDF,
  Token,
} from "../lib/helper";
import sqlite3 from "sqlite3";
import { open } from "sqlite";
const uploadDir = path.join(__dirname, "uploads");

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}
const dbPromise = open({
  filename: "./db.db",
  driver: sqlite3.Database,
});

export const CreateUser = async (req: Request, res: Response) => {
  const db = await connectDB();

  try {
    const { email, password } = req.body;

    db.get(
      "SELECT email FROM users WHERE email = ? AND role = 'user'",
      [email],
      async (error, row) => {
        if (error) {
          return res.status(400).send({ message: "Error while fetching" });
        }
        if (row) {
          return res.status(400).send({ message: "User already exists" });
        }
        const HashPassword = EncryptText(password);
        db.run(
          `INSERT INTO users (email, password, role) VALUES (?, ?, 'user')`,
          [email, HashPassword],
          (insertError) => {
            if (insertError) {
              return res.status(400).send({ message: "Failed to create user" });
            }
            return res.status(201).send({ message: "User created" });
          }
        );
      }
    );
  } catch (error) {
    res.status(400).send({ message: "Error" });
  }
};

export const LoginUser = async (req: Request, res: Response) => {
  const db = await connectDB();

  try {
    const { email, password } = req.body;

    const HashPassword = EncryptText(password);

    db.get(
      "SELECT id, email, password, role FROM users WHERE email = ? AND role = 'user'",
      [email],
      (
        error,
        row: { id: number; email: string; password: string; role: string }
      ) => {
        if (error) {
          return res.status(400).send({ message: "Error while fetching" });
        }

        if (!row) {
          return res.status(404).send({ message: "User not found" });
        }

        if (row.password === HashPassword) {
          const token = EncryptText(
            JSON.stringify({
              userId: row.id,
              email: row.email,
              role: "user",
              expiresIn: Date.now() + 24 * 60 * 60 * 1000,
            })
          );
          return res.status(200).send({ message: "User logged in", token });
        }

        return res.status(401).send({ message: "Wrong credentials" });
      }
    );
  } catch (error) {
    res.status(400).send({ message: "Error" });
  }
};

export const GetUserDetails = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const user = req.user;
    const db = await connectDB();
    if (!user?.userId) {
      res.status(404).send({ message: "unauthorized" });
      return;
    }

    db.get(
      ` SELECT u.id, u.email, u.role, u.credits, IFNULL(COUNT(d.id), 0) AS document_count
      FROM users u
      LEFT JOIN documents d ON u.id = d.user_id
      WHERE u.id = ?
      GROUP BY u.id`,
      [user.userId],
      (error, row) => {
        if (error) {
          res.status(404).send({ message: "error while fetching details" });
          return;
        }

        if (!row) {
          res.status(404).send({ message: "No data available" });
          return;
        }
        res.status(200).send({ message: "data fetched", data: row });
        return;
      }
    );
  } catch (error) {
    res.status(404).send({
      message:
        `
      ${error}` || "error with server",
    });
  }
};

export const UploadDocument = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const db = await connectDB();
    const user = req.user;
    const fileName = req.headers["fileName"] as string;
    const type = (req.headers["type"] as string).split("/")[1];
    const filePath = `./uploads/user_${user?.userId}_${Date.now()}.${type}`;
    const WRITE_DOCUMENT = fs.createWriteStream(filePath);

    req.pipe(WRITE_DOCUMENT);

    WRITE_DOCUMENT.on("finish", async () => {
      const PDFBuffer = fs.readFileSync(filePath);
      const EText = await ExtractDataFromPDF(PDFBuffer);
      db.run(`BEGIN TRANSACTION;`);
      db.run(
        `INSERT INTO documents(user_id, file_name, type,content) VALUES (?, ?, ?, ?)`,
        [user?.userId, fileName, type, EText]
      );
      db.run(`UPDATE users SET credits = credits - 1 WHERE id = ?`, [
        user?.userId,
      ]);
      db.run(`COMMIT;`);

      return res.status(200).send({
        message: "File uploaded successfully",
        file: filePath,
        data: EText,
      });
    });

    WRITE_DOCUMENT.on("error", (err) => {
      console.error("File Write Error:", err);
      return res.status(500).send({ message: "File upload failed" });
    });

    req.on("error", (err) => {
      console.error("Request Read Error:", err);
      return res.status(400).send({ message: "File upload failed" });
    });
  } catch (error) {
    res.status(400).send({ message: "Error" });
  }
};

export const GetAllDocuments = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  const db = await connectDB();
  try {
    db.all(`SELECT type, content FROM documents`, (error, rows) => {
      if (error) {
        return res
          .status(400)
          .send({ message: "Error connecting to database" });
      }
      return res.status(200).send({ message: "OK", documents: rows || [] });
    });
  } catch (error) {
    res.status(400).send({ message: "Error" });
  }
};

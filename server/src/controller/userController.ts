import { Request, Response } from "express";
import { connectDB } from "../lib/db";
import fs from "fs";
import path from "path";
import { AuthenticatedRequest, EncryptText, Token } from "../lib/helper";
import { error } from "console";

const destinationDIR = path.join(__dirname, "../../uploads");
if (!fs.existsSync(destinationDIR)) {
  fs.mkdirSync(destinationDIR);
}

export const CreateUser = async (req: Request, res: Response) => {
  const db = connectDB();

  try {
    const { email, password } = req.body;

    (await db).get(
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
        (await db).run(
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
  const db = connectDB();

  try {
    const { email, password } = req.body;

    const HashPassword = EncryptText(password);

    (await db).get(
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
  const user = req.user;
  const db = connectDB();
  try {
    (await db).get(
      `SELECT id, email, role, credits FROM users WHERE id = ?`,
      [user?.id],
      (error, row: { id: number; email: string; credits: number }) => {
        if (error) {
          res.status(404).send({ message: "error while fetching details" });
          return;
        }
        const data = user;
        res.status(200).send({ message: "data fetched", data });
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
export const GetAllDocuments = async (req: Request, res: Response) => {
  const db = connectDB();

  try {
    (await db).all("SELECT type, content FROM documents", (error, rows) => {
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

export const UploadDocument = async (req: Request, res: Response) => {
  const db = connectDB();

  try {
    const fileType = req.headers["type"] as string;
    const fileName = req.headers["filename"] as string;
    const filePath = path.join(
      destinationDIR,
      `user${1}_${fileName}_${Date.now()}.${fileType}`
    );

    const WRITE_DOCUMENT = fs.createWriteStream(filePath);

    req.on("data", (data) => {
      WRITE_DOCUMENT.write(data);
    });

    req.on("error", (err) => {
      return res.status(500).json({
        error: "Failed to upload file",
        details: err.message,
      });
    });

    req.on("end", async () => {
      WRITE_DOCUMENT.end();

      (await db).run(
        `INSERT INTO documents (user_id, file_path, type) VALUES (?, ?, ?)`,
        [1, filePath, fileType],
        (error) => {
          if (error) {
            return res.status(500).json({ message: "Failed to save document" });
          }
          return res
            .status(200)
            .json({ message: "File uploaded successfully" });
        }
      );
    });
  } catch (error) {
    res.status(400).send({ message: "Error" });
  }
};

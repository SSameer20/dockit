import { Request, Response } from "express";
import { connectDB } from "../lib/db";
import fs from "fs";
import path from "path";
import { AuthenticatedRequest, EncryptText, Token } from "../lib/helper";
import sqlite3 from "sqlite3";
import { open } from "sqlite";
const uploadDir = path.join(__dirname, "uploads");

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}
const dbPromise = open({
  filename: "../../db.db",
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
    const db = await dbPromise;
    const user = req.user;
    const fileName = req.headers["fileName"] as string;
    const fileType = req.headers["type"] as string;
    const filePath = path.join(
      uploadDir,
      `user_${user?.userId}_${fileName}_${Date.now()}_${fileType.split("/")[1]}`
    );

    const WRITE_DOCUMENT = fs.createWriteStream(filePath);
    req.on("data", (chunk) => {
      WRITE_DOCUMENT.write(chunk);
    });
    req.on("error", () => {
      return res.status(500).json({ message: "File upload failed" });
    });
    req.on("end", () => {
      console.log();
      return res
        .status(201)
        .send({ message: "uploaded", data: WRITE_DOCUMENT });
    });

    // if (!user?.userId) {
    //   return res.status(400).json({ message: "User ID missing" });
    // }
    // const extension = fileType.split("/")[1];
    // const filePath = path.join(
    //   __dirname,
    //   "uploads",
    //   `user_${user.userId}_${Date.now()}.${extension}`
    // );
    // let fileBuffer = Buffer.alloc(0);

    // req.on("data", (chunk) => {
    //   fileBuffer = Buffer.concat([fileBuffer, chunk]);
    // });

    // req.on("error", (err) => {
    //   console.error("Error processing file:", err);
    //   res.status(500).json({ message: "File processing error" });
    //   return;
    // });
    // req.on("end", async () => {
    //   const filePath = `../../uploads/${fileName}`;
    //   fs.writeFileSync(filePath, fileBuffer);

    //   let extractedText = "";

    //   if (fileType === "text/plain") {
    //     extractedText = fileBuffer.toString("utf-8");
    //   } else if (fileType === "application/pdf") {
    //     extractedText = extractPDFText(fileBuffer);
    //   } else if (fileType === "text/csv") {
    //     extractedText = fileBuffer.toString("utf-8");
    //   }
    //   await db.exec(
    //     `
    //     BEGIN TRANSACTION;

    //     INSERT INTO documents (user_id, file_name, type, content)
    //     VALUES (${user.userId}, '${fileName}', '${extension}', '${extractedText}');

    //     UPDATE users SET credits = credits - 1 WHERE id = ${user?.userId};

    //     COMMIT;
    //     `
    //   );

    // res.status(201).json({ message: "Document uploaded successfully" });
    // });
  } catch (error) {
    console.error("Upload Error:", error);
    res.status(500).json({ message: "Server error", error });
  }
};
export const GetUserDocuments = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  const db = await connectDB();
  const user = req.user;

  try {
    db.all(
      `SELECT type, content FROM documents WHERE user_id = ?`,
      [user?.userId],
      (error, rows) => {
        if (error) {
          return res
            .status(400)
            .send({ message: "Error connecting to database" });
        }
        return res.status(200).send({ message: "OK", documents: rows || [] });
      }
    );
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

import { Request, Response } from "express";
import { connectDB } from "../lib/db";
import { EncryptText } from "../lib/helper";

export const CreateAdmin = async (req: Request, res: Response) => {
  const db = connectDB();

  try {
    const { email, password } = req.body;

    (await db).get(
      "SELECT email FROM users WHERE email = ? AND role = 'admin'",
      [email],
      async (error, row) => {
        if (error) {
          return res.status(400).send({ message: "Error while fetching" });
        }
        if (row) {
          return res.status(400).send({ message: "User already exists" });
        }

        // Proceed with user creation
        const HashPassword = EncryptText(password);
        (await db).run(
          `INSERT INTO users (email, password, role) VALUES (?, ?, 'admin')`,
          [email, HashPassword],
          (error) => {
            if (error) {
              return res.status(400).send({ message: "Failed to create user" });
            }
            return res.status(201).send({ message: "admin created" });
          }
        );
      }
    );
  } catch (error) {
    res.status(400).send({ message: "Error" });
  }
};

export const LoginAdmin = async (req: Request, res: Response) => {
  const db = connectDB();

  try {
    const { email, password } = req.body;
    const HashPassword = EncryptText(password);

    (await db).get(
      "SELECT id, email, password, role FROM users WHERE email = ? AND role = 'admin'",
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
              role: "admin",
              expiresIn: Date.now() + 24 * 60 * 60 * 1000,
            })
          );
          return res.status(200).send({ message: "admin logged in", token });
        }

        return res.status(401).send({ message: "Wrong credentials" });
      }
    );
  } catch (error) {
    res.status(400).send({ message: "Error" });
  }
};

export const GetAllUser = async (req: Request, res: Response) => {
  const db = connectDB();
  try {
    (await db).get("SELECT email FROM users", (error, row) => {
      if (error) {
        res.send({ message: "error with connecting database" }).status(400);
        return;
      }
      if (row) {
        res.send({ message: "ok", users: row }).status(200);
        return;
      }
    });
  } catch (error) {
    res.send({ message: "error" }).status(400);
  } finally {
    (await db).close();
  }
};

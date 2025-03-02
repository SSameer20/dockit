import { Request, Response } from "express";
import { connectDB } from "../lib/db";

export const createUser = async (req: Request, res: Response) => {
  const db = connectDB();
  try {
    const { email, password } = req.body;

    (await db).get(
      "SELECT email FROM users WHERE email = ?",
      [email],
      (error, row) => {
        if (error) {
          res.send({ message: "error while fetching" }).status(400);
          return;
        }
        if (row) {
          res.send({ message: "user already exists" }).status(400);
          return;
        }
      }
    );

    (await db).run(
      `insert into users (email, password) values (? , ? )`,
      [email, password],
      (error) => {
        if (error) {
          res.send({ message: "failed to create user" }).status(400);
          return;
        } else {
          res.send({ message: "user created" }).status(201);
          return;
        }
      }
    );
  } catch (error) {
    res.send({ message: "error" }).status(400);
  } finally {
    (await db).close();
  }
};

export const GetAllUser = async (req: Request, res: Response) => {
  const db = connectDB();
  try {
    (await db).get("SELECT id, email FROM users", (error, row) => {
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

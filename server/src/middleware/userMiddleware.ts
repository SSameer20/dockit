import { Response, NextFunction } from "express";
import { AuthenticatedRequest, DecryptText, Token } from "../lib/helper";
import { connectDB } from "../lib/db";

export const UserMiddlware = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      res.status(404).send({ message: "not authorized please log in again" });
      return;
    }
    const data: Token = JSON.parse(DecryptText(token));
    if (data.role !== "user") {
      res.status(404).send({ message: "Unauthorized: Invalid token" });
      return;
    }
    if (Date.now() > data.expireIn) {
      res.status(404).send({ message: "Token Expired" });
      return;
    }
    const db = await connectDB();
    req.user = data;
    db.run(`INSERT INTO user_requests (user_id,request) VALUES (? , ?)`, [
      req.user.userId,
      req.route.path,
    ]);
    next();
  } catch (error) {
    res.status(404).send({ message: "please try again" });
  }
};

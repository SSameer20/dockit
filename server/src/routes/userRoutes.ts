import { Router } from "express";
import { createUser, GetAllUser } from "../controller/userController";
export const userRouter = Router();
userRouter.post("/create", createUser);
userRouter.get("/all", GetAllUser);

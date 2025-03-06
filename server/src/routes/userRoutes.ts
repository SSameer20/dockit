import { Router } from "express";
import {
  CreateUser,
  GetAllDocuments,
  LoginUser,
} from "../controller/userController";
import { UserMiddlware } from "../middleware/userMiddleware";
const UserRouter = Router();
UserRouter.post("/auth/register", CreateUser);
UserRouter.post("/auth/login", LoginUser);
UserRouter.get("/documents", UserMiddlware, GetAllDocuments);
UserRouter.get("/documents/:id", UserMiddlware, GetAllDocuments);

export default UserRouter;

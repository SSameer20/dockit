import { Router } from "express";
import {
  CreateAdmin,
  LoginAdmin,
  GetAllUser,
} from "../controller/adminController";
import { AdminMiddlware } from "../middleware/adminMiddleware";

const AdminRouter = Router();
AdminRouter.post("/auth/register", CreateAdmin);
AdminRouter.post("/auth/login", LoginAdmin);
AdminRouter.get("/all", AdminMiddlware, GetAllUser);
export default AdminRouter;

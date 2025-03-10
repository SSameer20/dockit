import { Router } from "express";
import {
  CreateUser,
  UploadDocument,
  LoginUser,
  GetUserDetails,
  GetAllDocuments,
  GetUserRequestData,
} from "../controller/userController";
import { UserMiddlware } from "../middleware/userMiddleware";
const UserRouter = Router();
UserRouter.post("/auth/register", CreateUser);
UserRouter.post("/auth/login", LoginUser);

UserRouter.get("/profile", UserMiddlware, GetUserDetails);
UserRouter.get("/requests", UserMiddlware, GetUserRequestData);
UserRouter.post("/credits/request", UserMiddlware, GetUserDetails);
UserRouter.post("/documents/scan", UserMiddlware, async (req, res) => {
  await UploadDocument(req, res);
});
// UserRouter.get("/documents/user", UserMiddlware, GetUserDocuments);
UserRouter.get("/documents", UserMiddlware, GetAllDocuments);

export default UserRouter;

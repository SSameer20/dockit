"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.userRouter = void 0;
const express_1 = require("express");
const userController_1 = require("../controller/userController");
exports.userRouter = (0, express_1.Router)();
exports.userRouter.post("/create", userController_1.createUser);
exports.userRouter.get("/all", userController_1.GetAllUser);

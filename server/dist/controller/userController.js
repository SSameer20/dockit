"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetAllUser = exports.createUser = void 0;
const db_1 = require("../lib/db");
const createUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const db = (0, db_1.connectDB)();
    try {
        const { email, password } = req.body;
        (yield db).get("SELECT * FROM users WHERE email = ?", [email], (error, row) => {
            if (error) {
                res.send({ message: "error while fetching" }).status(400);
                return;
            }
            if (row) {
                res.send({ message: "user already exists" }).status(400);
                return;
            }
        });
        (yield db).run(`insert into users (email, password) values (? , ? )`, [email, password], (error) => {
            if (error) {
                res.send({ message: "failed to create user" }).status(400);
                return;
            }
            else {
                res.send({ message: "user created" }).status(201);
                return;
            }
        });
    }
    catch (error) {
        res.send({ message: "error" }).status(400);
    }
    finally {
        (yield db).close();
    }
});
exports.createUser = createUser;
const GetAllUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const db = (0, db_1.connectDB)();
    try {
        (yield db).get("SELECT * FROM users", (error, row) => {
            if (error) {
                res.send({ message: "error with connecting database" }).status(400);
                return;
            }
            if (row) {
                res.send({ message: "ok", users: row }).status(200);
                return;
            }
        });
    }
    catch (error) {
        res.send({ message: "error" }).status(400);
    }
    finally {
        (yield db).close();
    }
});
exports.GetAllUser = GetAllUser;

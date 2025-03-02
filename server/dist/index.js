"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const db_1 = require("./lib/db");
const app = (0, express_1.default)();
const PORT = 8000;
const main = () => {
    if ((0, db_1.connectDB)()) {
        app.listen(PORT, () => {
            console.log(`server is running http://localhost:${PORT}`);
        });
    }
};
main();

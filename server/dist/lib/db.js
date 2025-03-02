"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectDB = connectDB;
const sqlite3_1 = __importDefault(require("sqlite3"));
function connectDB() {
    const db = new sqlite3_1.default.Database("../database.db", sqlite3_1.default.OPEN_READWRITE | sqlite3_1.default.OPEN_CREATE, (error) => {
        if (error) {
            console.log(`Error while connecting to database`);
        }
        console.log(`connecetd to database`);
    });
    return db;
}

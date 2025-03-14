import { Request } from "express";
import fs from "fs";
import zlib from "zlib";
import pdf from "pdf-parse";
const secret = "my-secret";
export const EncryptText = (data: string): string => {
  const buffer = Buffer.from(data + secret);
  const encryptData = buffer.toString("base64");
  return encryptData;
};

export const DecryptText = (hashData: string): string => {
  const buffer = Buffer.from(hashData, "base64");
  const decryptData = buffer.toString("utf-8");
  return decryptData.slice(0, decryptData.length - 9);
};

export interface AuthenticatedRequest extends Request {
  user?: Token;
}
export interface Token {
  userId: number;
  email: string;
  password?: string;
  role: string;
  expireIn: number;
}

export const Log = {
  info: (message: string) => {
    const logFile = "./src/lib/logs.txt";
    fs.appendFile(
      logFile,
      `\n[SUCCESS]-[${new Date()}]-${message}`,
      (error) => {
        if (error) {
          console.log(`${error}`);
          return;
        }
      }
    );
  },
  error: (message: string) => {
    const logFile = "./src/lib/logs.txt";
    fs.appendFile(logFile, `\n[ERROR]-[${new Date()}]-${message}`, (error) => {
      if (error) {
        console.log(`[ERROR]-${error}`);
        return;
      }
    });
  },
};

export async function ExtractDataFromPDF(bf: Buffer): Promise<string> {
  const data = await pdf(bf);
  return data.text;
}

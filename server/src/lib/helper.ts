import fs from "fs";
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

export interface Token {
  id: number;
  email: string;
  password: string;
  role: string;
  expireIn: number;
}

export function WriteToLogFile(message: string) {
  const logFile = "./src/lib/logs.txt";
  fs.appendFile(logFile, `\n${message}`, (error) => {
    if (error) {
      console.log(`[ERROR]-${error}`);
      return;
    }
  });
}

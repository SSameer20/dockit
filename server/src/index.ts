import express from "express";
import cors from "cors";
import { userRouter } from "./routes/userRoutes";
const app = express();

app.use(cors());
app.use(express.json());
app.use("/api/v1/user", userRouter);
const main = () => {
  const PORT = 8000;
  app.listen(PORT, () => {
    console.log(`server is running http://localhost:${PORT}`);
  });
};

main();

import express from "express";
import cors from "cors";
import { AdminRouter, UserRouter } from "./routes/Route";
const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/user", UserRouter);
app.use("/admin", AdminRouter);

const main = () => {
  const PORT = 8000;
  app.listen(PORT, () => {
    console.log(`server is running http://localhost:${PORT}`);
  });
};
main();

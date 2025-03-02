import express from "express";
const app = express();

const main = () => {
  const PORT = 8000;
  app.listen(PORT, () => {
    console.log(`server is running http://localhost:${PORT}`);
  });
};

main();

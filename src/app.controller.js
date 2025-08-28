import * as dotenv from "dotenv";
import path from "node:path";
import checkDbConnection from "./db/connection.db.js";
import express from "express";

async function bootstrap() {
  const filePath = path.resolve("./src/config/.env.dev");
  dotenv.config({ path: filePath });

  const app = express();
  const port = process.env.PORT;

  const result = await checkDbConnection();
  if (!result) {
    app.all("{/*d}", (req, res, next) => {
      return res.status(500).json({
        success: false,
        error: "Something went wrong, please come back later ❌",
      });
    });
  } else {
    app.all("{/*d}", (req, res, next) => {
      return res
        .status(404)
        .json({
          success: false,
          error: `Wrong URI ${req.url} or MOTHED ${req.method}`,
        });
    });
  }

  app.use((error, req, res, next) => {});
  app.listen(port, (error) => {
    if (error) console.log("Fail Running Server");
    else console.log(`Server is Running on PORT ${port}`);
  });
}

export default bootstrap;

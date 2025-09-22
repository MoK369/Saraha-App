import * as dotenv from "dotenv";
import path from "node:path";
import checkDbConnection from "./db/connection.db.js";
import express from "express";
import errorHandler from "./utils/handlers/error.handler.js";
import authController from "./modules/auth/auth.controller.js";
import userController from "./modules/user/user.controller.js";
import messageController from "./modules/message/message.controller.js";
import cors from "cors";

async function bootstrap() {
  const filePath = path.resolve("./src/config/.env.dev");
  dotenv.config({ path: filePath });

  const app = express();
  const port = process.env.PORT;

  // cors origin
  app.use(cors());

  const result = await checkDbConnection();
  if (!result) {
    app.all("{/*d}", (req, res, next) => {
      return res.status(500).json({
        success: false,
        error: "Something went wrong, please come back later ❌",
      });
    });
  } else {
    app.use("/uploads", express.static(path.resolve("./src/uploads")));
    app.use(express.json());
    app.use("/auth", authController);
    app.use("/user", userController);
    app.use("/message", messageController);
    app.all("{/*d}", (req, res, next) => {
      return res.status(404).json({
        success: false,
        error: `Wrong URI ${req.url} or MOTHED ${req.method}`,
      });
    });
  }

  app.use(errorHandler);
  app.listen(port, (error) => {
    if (error) {
      console.log("Fail Running Server");
      console.log(error);
    } else console.log(`Server is Running on PORT ${port}`);
  });
}

export default bootstrap;

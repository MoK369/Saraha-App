import * as dotenv from "dotenv";
import path from "node:path";
import checkDbConnection from "./db/connection.db.js";
import express from "express";
import errorHandler from "./utils/handlers/error.handler.js";
import authController from "./modules/auth/auth.controller.js";
import userController from "./modules/user/user.controller.js";
import messageController from "./modules/message/message.controller.js";
import cors from "cors";
import morgan from "morgan";
import helmet from "helmet";
import { rateLimit } from "express-rate-limit";

async function bootstrap() {
  const filePath = path.resolve("./src/config/.env.dev");
  dotenv.config({ path: filePath });

  const app = express();
  const port = process.env.PORT;

  // cors origins
  //var whitelist = process.env.CORS_ORIGINS?.split(",") || [];

  // Solve problem of Private Network Access if the front-end was public and the back-end was local or vise versa
  // app.use(async (req, res, next) => {
  //   if (!whitelist.includes(`${req.header("origin")}`)) {
  //     return next(new Error("Not Allowed By CORS", { status: 403 }));
  //   }
  //   for (const origin of whitelist) {
  //     if (`${req.header("origin")}` == origin) {
  //       res.header("Access-Control-Allow-Origin", origin);
  //       break;
  //     }
  //   }
  //   res.header("Access-Control-Allow-Headers", "*");
  //   res.header("Access-Control-Allow-Private-Network", "true");
  //   res.header("Access-Control-Allow-Methods", "*");
  //   console.log("Origin Work");
  //   next();
  // });

  // var corsOptions = {
  //   origin: function (origin, callback) {
  //     console.log({ origin });
  //     if (whitelist.indexOf(`${origin}`) !== -1) {
  //       callback(null, true);
  //     } else {
  //       callback(new CustomError("Not allowed by CORS", 400));
  //     }
  //   },
  // };
  app.use(cors());
  // ================================

  // Helmet Middleware
  app.use(helmet());

  // RateLimiter Middleware
  app.use(
    rateLimit({
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 100, // limit each IP to 100 requests per windowMs
      standardHeaders: "draft-8", // Return rate limit info in the `RateLimit-*` headers
      legacyHeaders: false, // Disable the `X-RateLimit-*` headers
    })
  );

  // morgan logger
  app.use(morgan("dev"));
  //console.log(morgan("common"));

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

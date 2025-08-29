import { Router } from "express";
import * as userService from "./user.service.js";
import authenticationMiddleware from "../../middleware/authentication.middleware.js";

const userRouter = Router();
userRouter.get(
  "/profile",
  authenticationMiddleware(),
  userService.getUserProfile
);
userRouter.get(
  "/refresh-access-token",
  authenticationMiddleware({ authOnRefreshToken: true }),
  userService.refreshAccessToken
);

export default userRouter;

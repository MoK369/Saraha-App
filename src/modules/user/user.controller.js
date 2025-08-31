import { Router } from "express";
import * as userService from "./user.service.js";
import authenticationMiddleware from "../../middleware/authentication.middleware.js";
import { tokenTypeEnum } from "../../utils/constants/enum.constants.js";

const userRouter = Router();
userRouter.get(
  "/profile",
  authenticationMiddleware(),
  userService.getUserProfile
);
userRouter.get(
  "/refresh-token",
  authenticationMiddleware({ tokenType: tokenTypeEnum.refresh }),
  userService.getNewLoginCredentials
);

export default userRouter;

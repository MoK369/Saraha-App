import { Router } from "express";
import * as userService from "./user.service.js";
import authenticationMiddleware from "../../middleware/authentication.middleware.js";
import { tokenTypeEnum } from "../../utils/constants/enum.constants.js";
import authorizationMiddleware from "../../middleware/authorization.middleware.js";
import endpointAuth from "./user.authorization.js";
import combinedAuth from "../../middleware/combined_auth.meddleware.js";

const userRouter = Router();
userRouter.get(
  "/profile",
  //authenticationMiddleware(),
  combinedAuth({ accessRole: endpointAuth.profile }),
  //authorizationMiddleware({ accessRole: endpointAuth.profile }),
  userService.getUserProfile
);
userRouter.get(
  "/refresh-token",
  //authenticationMiddleware({ tokenType: tokenTypeEnum.refresh }),
  combinedAuth({
    tokenType: tokenTypeEnum.refresh,
    accessRole: endpointAuth.refreshToken,
  }),
  userService.getNewLoginCredentials
);

export default userRouter;

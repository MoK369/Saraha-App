import { Router } from "express";
import * as userService from "./user.service.js";
import authenticationMiddleware from "../../middleware/authentication.middleware.js";
import { tokenTypeEnum } from "../../utils/constants/enum.constants.js";
import validationMiddleware from "../../middleware/validation.middleware.js";
import userValidators from "./user.validation.js";


const userRouter = Router();
userRouter.get(
  "/profile",
  validationMiddleware({ validationSchema: userValidators.profile }),
  authenticationMiddleware(),
  //combinedAuth({ accessRole: endpointAuth.profile }),
  userService.getUserProfile
);
userRouter.get(
  "/refresh-token",
  validationMiddleware({ validationSchema: userValidators.refeshToken }),
  authenticationMiddleware({ tokenType: tokenTypeEnum.refresh }),
  // combinedAuth({
  //   tokenType: tokenTypeEnum.refresh,
  //   accessRole: endpointAuth.refreshToken,
  // }),
  userService.getNewLoginCredentials
);

export default userRouter;

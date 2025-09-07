import { Router } from "express";
import * as userService from "./user.service.js";
import authenticationMiddleware from "../../middleware/authentication.middleware.js";
import { tokenTypeEnum } from "../../utils/constants/enum.constants.js";
import validationMiddleware from "../../middleware/validation.middleware.js";
import userValidators from "./user.validation.js";
import combinedAuth from "../../middleware/combined_auth.meddleware.js";
import endpointAuth from "./user.authorization.js";
import authorizationMiddleware from "../../middleware/authorization.middleware.js";

const userRouter = Router();
userRouter.get(
  "/profile",
  validationMiddleware({ validationSchema: userValidators.profile }),
  authenticationMiddleware(),
  userService.getUserProfile
);
userRouter.get(
  "/refresh-token",
  validationMiddleware({ validationSchema: userValidators.refeshToken }),
  authenticationMiddleware({ tokenType: tokenTypeEnum.refresh }),
  userService.getNewLoginCredentials
);

userRouter.patch(
  "/update-basic-profile",
  authenticationMiddleware(),
  validationMiddleware({ validationSchema: userValidators.updateBasicProfile }),
  userService.updateBasicProfile
);

userRouter.delete(
  "{/:userId}/freeze-account",
  authenticationMiddleware(),
  validationMiddleware({ validationSchema: userValidators.freezeAccount }),
  userService.freezeAccount
);
userRouter.delete(
  "/:userId",
  combinedAuth({accessRole: endpointAuth.deleteAccount}),
  validationMiddleware({ validationSchema: userValidators.deleteAccount }),
  userService.deleteAccount
);


userRouter.patch(
  "/:userId/restore-account",
  combinedAuth({accessRole: endpointAuth.restoreAccount }),
  validationMiddleware({ validationSchema: userValidators.restoreAccount }),
  userService.restoreAccount
);

userRouter.get(
  "/:userId",
  validationMiddleware({ validationSchema: userValidators.shareUserProfile }),
  userService.shareUserProfile
);

export default userRouter;

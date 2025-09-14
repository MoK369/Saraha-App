import { Router } from "express";
import * as userService from "./user.service.js";
import authenticationMiddleware from "../../middleware/authentication.middleware.js";
import { tokenTypeEnum } from "../../utils/constants/enum.constants.js";
import validationMiddleware from "../../middleware/validation.middleware.js";
import userValidators from "./user.validation.js";
import combinedAuth from "../../middleware/combined_auth.meddleware.js";
import endpointAuth from "./user.authorization.js";
import localFileUpload from "../../utils/multer/local.multer.js";
import fileValidation from "../../utils/constants/files_validation.constants.js";

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

userRouter.get(
  "/:userId",
  validationMiddleware({ validationSchema: userValidators.shareUserProfile }),
  userService.shareUserProfile
);

userRouter.delete(
  "{/:userId}/freeze-account",
  authenticationMiddleware(),
  validationMiddleware({ validationSchema: userValidators.freezeAccount }),
  userService.freezeAccount
);
userRouter.delete(
  "/:userId",
  combinedAuth({ accessRole: endpointAuth.deleteAccount }),
  validationMiddleware({ validationSchema: userValidators.deleteAccount }),
  userService.deleteAccount
);

userRouter.patch(
  "/update-basic-profile",
  authenticationMiddleware(),
  validationMiddleware({ validationSchema: userValidators.updateBasicProfile }),
  userService.updateBasicProfile
);

userRouter.patch(
  "/update-password",
  authenticationMiddleware(),
  validationMiddleware({ validationSchema: userValidators.updatePassword }),
  userService.updatePassword
);

userRouter.patch(
  "/profile-image",
  authenticationMiddleware(),
  localFileUpload({
    customPath: "user",
    validation: fileValidation.image,
  }).single("image"),
  userService.updateProfileImage
);

userRouter.patch(
  "/:userId/restore-account",
  combinedAuth({ accessRole: endpointAuth.restoreAccount }),
  validationMiddleware({ validationSchema: userValidators.restoreAccount }),
  userService.restoreAccount
);

userRouter.post(
  "/logout",
  authenticationMiddleware(),
  validationMiddleware({ validationSchema: userValidators.logout }),
  userService.logout
);

export default userRouter;

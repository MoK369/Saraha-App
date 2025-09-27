import { Router } from "express";
import * as userService from "./user.service.js";
import authenticationMiddleware from "../../middleware/authentication.middleware.js";
import { tokenTypeEnum } from "../../utils/constants/enum.constants.js";
import validationMiddleware from "../../middleware/validation.middleware.js";
import userValidators from "./user.validation.js";
import combinedAuth from "../../middleware/combined_auth.meddleware.js";
import endpointAuth from "./user.authorization.js";
import fileValidation from "../../utils/constants/files_validation.constants.js";
import cloudFileUpload from "../../utils/multer/cloud.multer.js";
import authorizationMiddleware from "../../middleware/authorization.middleware.js";
import messageRouter from "../message/message.controller.js";

const userRouter = Router({ caseSensitive: true });

userRouter.use(
  "/:userId/messages",
  messageRouter
);

userRouter.get(
  "/profile",
  authenticationMiddleware(),
  userService.getUserProfile
);

userRouter.get(
  "/share-profile",
  authenticationMiddleware(),
  userService.shareUserProfile
);

userRouter.get(
  "/refresh-token",
  authenticationMiddleware({ tokenType: tokenTypeEnum.refresh }),
  userService.getNewLoginCredentials
);

userRouter.get(
  "/",
  combinedAuth({accessRole: endpointAuth.getAllUsers}),
  validationMiddleware({ validationSchema: userValidators.getAllUsers }),
  userService.getAllUsers
);

userRouter.get(
  "/:userId",
  validationMiddleware({ validationSchema: userValidators.getUserById }),
  userService.getUserById
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
  cloudFileUpload({
    validation: fileValidation.image,
  }).single("image"),
  validationMiddleware({ validationSchema: userValidators.profileImage }),
  userService.updateProfileImage
);
userRouter.patch(
  "/profile-cover-images",
  authenticationMiddleware(),
  cloudFileUpload({
    validation: fileValidation.image,
    fileSize: 1024 * 1024, // 1MB
  }).array("images", 2),
  validationMiddleware({ validationSchema: userValidators.profileCoverImages }),
  userService.updateProfileCoverImages
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

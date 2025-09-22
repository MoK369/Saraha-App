import { Router } from "express";
import * as messageService from "./message.service.js";
import cloudFileUpload from "../../utils/multer/cloud.multer.js";
import fileValidation from "../../utils/constants/files_validation.constants.js";
import validationMiddleware from "../../middleware/validation.middleware.js";
import messageValidators from "./message.validation.js";
import authenticationMiddleware from "../../middleware/authentication.middleware.js";

const messageRouter = Router();


messageRouter.post(
  "/:recieverId/sender",
  authenticationMiddleware(),
  cloudFileUpload({
    validation: fileValidation.image,
    fileSize: 1024 * 1024, // 1MB
  }).array("attachments"),
  validationMiddleware({validationSchema: messageValidators.sendMessage}),
  messageService.sendMessage
);

messageRouter.post(
  "/:recieverId",
  cloudFileUpload({
    validation: fileValidation.image,
    fileSize: 1024 * 1024, // 1MB
  }).array("attachments"),
  validationMiddleware({validationSchema: messageValidators.sendMessage}),
  messageService.sendMessage
);

export default messageRouter;

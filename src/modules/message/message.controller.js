import { Router } from "express";
import * as messageService from "./message.service.js";
import cloudFileUpload from "../../utils/multer/cloud.multer.js";
import fileValidation from "../../utils/constants/files_validation.constants.js";
import validationMiddleware from "../../middleware/validation.middleware.js";
import messageValidators from "./message.validation.js";
import authenticationMiddleware from "../../middleware/authentication.middleware.js";
import combinedAuth from "../../middleware/combined_auth.meddleware.js";
import endpointAuth from "./message.authorization.js";

const messageRouter = Router();

messageRouter.post(
  "/:recieverId/sender",
  authenticationMiddleware(),
  cloudFileUpload({
    validation: fileValidation.image,
    fileSize: 1024 * 1024, // 1MB
  }).array("attachments"),
  validationMiddleware({ validationSchema: messageValidators.sendMessage }),
  messageService.sendMessage
);

messageRouter.post(
  "/:recieverId",
  cloudFileUpload({
    validation: fileValidation.image,
    fileSize: 1024 * 1024, // 1MB
  }).array("attachments"),
  validationMiddleware({ validationSchema: messageValidators.sendMessage }),
  messageService.sendMessage
);

messageRouter.get(
  "/all-messages",
  authenticationMiddleware(),
  messageService.getAllMessages
);

messageRouter.get(
  "/:id",
  authenticationMiddleware(),
  validationMiddleware({ validationSchema: messageValidators.getMessageById }),
  messageService.getMessageById
);

messageRouter.delete(
  "/soft-delete-message/:id",
  authenticationMiddleware(),
  validationMiddleware({ validationSchema: messageValidators.deleteMessage }),
  messageService.softDeleteMessage
);

messageRouter.delete(
  "/hard-delete-message/:id",
  combinedAuth({ accessRole: endpointAuth.hardDeleteMessage }),
  validationMiddleware({ validationSchema: messageValidators.deleteMessage }),
  messageService.hardDeleteMessage
);

messageRouter.patch(
  "/restore-message/:id",
  combinedAuth({ accessRole: endpointAuth.restoreMessage }),
  validationMiddleware({ validationSchema: messageValidators.restoreMessage }),
  messageService.restoreMessage
);

export default messageRouter;

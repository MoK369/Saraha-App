import MessageModel from "../../db/models/message.model.js";
import UserModel from "../../db/models/user.model.js";
import DBService from "../../db/service.db.js";
import asyncHandler from "../../utils/handlers/async.handler.js";
import successHandler from "../../utils/handlers/success.handler.js";
import { cloudinaryUploadFiles } from "../../utils/multer/cloudinary.js";

export const sendMessage = asyncHandler(async (req, res, next) => {
  const { recieverId } = req.params;

  if (!req.body?.content && !req.files?.length) {
    throw new Error("Message content or attachments are required", 400);
  }
  if (
    !(await DBService.findOne({
      model: UserModel,
      filter: {
        _id: recieverId,
        confirmEmail: { $exists: true },
        deletedAt: { $exists: false },
      },
    }))
  ) {
    throw new Error("In-valid recipient account", 404);
  }

  const { content } = req.body;
  let attachments = [];
  if (req.files?.length) {
    attachments = await cloudinaryUploadFiles({
      files: req.files,
      path: `messages/${recieverId}`,
    });
  }

  const [message] = await DBService.create({
    model: MessageModel,
    docs: [
      { content, attachments, receiverId: recieverId, senderId: req.user?.id },
    ],
  });

  return successHandler({
    res,
    status: 201,
    message: "Message Sent Successfully",
    body: message,
  });
});

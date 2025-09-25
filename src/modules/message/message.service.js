import MessageModel from "../../db/models/message.model.js";
import UserModel from "../../db/models/user.model.js";
import DBService from "../../db/service.db.js";
import { roleEnum } from "../../utils/constants/enum.constants.js";
import CustomError from "../../utils/custom/error_class.custom.js";
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
    throw new CustomError("In-valid recipient account", 404);
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

export const getUserMessages = asyncHandler(async (req, res, next) => {
  const { userId } = req.params;
  let messages = await DBService.find({
    model: MessageModel,
    filter: { receiverId: userId },
    options: { sort: { createdAt: -1 } },
    select: "-updatedAt",
    populate: [
      { path: "senderId", select: "email lastName firstName profilePicture" },
    ],
  });

  if (!messages.length) {
    throw new CustomError("No messages found for this user", 404);
  }

  return successHandler({
    res,
    message: "Messages fetched successfully",
    body: messages,
  });
});

export const getAllMessages = asyncHandler(async (req, res, next) => {
  let messages = await DBService.find({
    model: MessageModel,
    filter: { receiverId: req.user.id, deletedAt: { $exists: false } },
    options: { sort: { createdAt: -1 } },
    select: "-updatedAt",
    populate: [
      { path: "senderId", select: "email lastName firstName profilePicture" },
    ],
  });

  return successHandler({
    res,
    message: "Messages fetched successfully",
    body: messages,
  });
});

export const getMessageById = asyncHandler(async (req, res, next) => {
  console.log("hello from getMessageById============");
  const { userId, id } = req.params;

  if (userId && req.user.role !== roleEnum.admin) {
    throw new CustomError("Not Authorized to get another user message", 403);
  }

  const filterObj =
    req.user.role === roleEnum.admin ? {} : { deletedAt: { $exists: false } };
  const message = await DBService.findOne({
    model: MessageModel,
    filter: { _id: id, receiverId: userId || req.user.id, ...filterObj },
    select: "-updatedAt",
    populate: [
      { path: "senderId", select: "email lastName firstName profilePicture" },
    ],
  });
  if (!message) {
    throw new CustomError("In-valid message id or deleted", 404);
  }
  return successHandler({
    res,
    message: "Message fetched successfully",
    body: message,
  });
});

export const softDeleteMessage = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  const optionalFilter =
    req.user.role === "admin" ? {} : { receiverId: req.user.id };
  const message = await DBService.findOneAndUpdate({
    model: MessageModel,
    filter: { _id: id, ...optionalFilter, deletedAt: { $exists: false } },
    update: { deletedAt: new Date() },
    select: "-updatedAt",
  });
  if (!message) {
    throw new CustomError("In-valid message id or already deleted", 404);
  }
  return successHandler({
    res,
    message: "Message deleted successfully",
    body: message,
  });
});

export const hardDeleteMessage = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const result = await DBService.deleteOne({
    model: MessageModel,
    filter: { _id: id, deletedAt: { $exists: true } },
  });
  if (!result.deletedCount) {
    throw new CustomError("In-valid message id", 404);
  }
  return successHandler({
    res,
    message: "Message hard deleted successfully",
  });
});

export const restoreMessage = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  const message = await DBService.findOneAndUpdate({
    model: MessageModel,
    filter: { _id: id, deletedAt: { $exists: true } },
    update: { $unset: { deletedAt: 1 } },
    select: "-updatedAt",
  });
  if (!message) {
    throw new CustomError("In-valid message id or not deleted", 404);
  }
  return successHandler({
    res,
    message: "Message restored successfully",
    body: message,
  });
});

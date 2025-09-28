import Joi from "joi";
import generalFields from "../../utils/constants/fields_validation.constants.js";
import fileValidation from "../../utils/constants/files_validation.constants.js";

const sendMessage = {
  params: Joi.object().keys({
    recieverId: generalFields.objectId.required(),
  }),
  body: Joi.object().keys({
    content: Joi.string().min(3).max(200000),
    attachments: Joi.string().messages({
      "string.empty": "attachments must not be empty",
    }),
  }).required().messages({
    "any.required": "body cannot be empty",
  }),
  files: Joi.array()
    .items(
      Joi.object().keys({
        fieldname: generalFields.fileKeys.fieldname.valid("attachments"),
        originalname: generalFields.fileKeys.originalname,
        encoding: generalFields.fileKeys.encoding,
        mimetype: generalFields.fileKeys.mimetype.valid(
          ...fileValidation.image
        ),
        destination: generalFields.fileKeys.destination,
        filename: generalFields.fileKeys.filename,
        path: generalFields.fileKeys.path,
        size: generalFields.fileKeys.size.max(1024 * 1024), // 1MB
      })
    )
    .max(2),
};

const getUserMessages = {
  params: Joi.object().keys({
    userId: generalFields.objectId.required(),
  }),
  query: Joi.object().keys({
    page: generalFields.pageNum,
    pageSize: generalFields.pageSize,
  }),
};

const getAllMessages = {
  query: Joi.object().keys({
    page: generalFields.pageNum,
    pageSize: generalFields.pageSize,
  }),
};

const getMessageById = {
  params: Joi.object().keys({
    userId: generalFields.objectId,
    id: generalFields.objectId.required(),
  }),
};

const deleteMessage = {
  params: Joi.object().keys({
    id: generalFields.objectId.required(),
  }),
};

const restoreMessage = {
  params: Joi.object().keys({
    id: generalFields.objectId.required(),
  }),
};

const messageValidators = {
  sendMessage,
  getUserMessages,
  getAllMessages,
  getMessageById,
  deleteMessage,
  restoreMessage
};

export default messageValidators;
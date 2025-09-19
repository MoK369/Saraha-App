import Joi from "joi";
import generalFields from "../../utils/constants/fields_validation.constants.js";
import { logoutEnum } from "../../utils/constants/enum.constants.js";
import fileValidation from "../../utils/constants/files_validation.constants.js";

const shareUserProfile = {
  params: Joi.object().keys({
    userId: generalFields.objectId.required(),
  }),
};

const updateBasicProfile = {
  body: Joi.object()
    .keys({
      fullName: generalFields.fullName,
      phone: generalFields.phone,
      gender: generalFields.gender,
    })
    .required()
    .messages({
      "any.required": "missing body data",
    }),
};

const freezeAccount = {
  params: Joi.object().keys({
    userId: generalFields.objectId,
  }),
};

const restoreAccount = {
  params: Joi.object().keys({
    userId: generalFields.objectId.required(),
  }),
};

const deleteAccount = {
  params: Joi.object().keys({
    userId: generalFields.objectId.required(),
  }),
};

const logout = {
  body: Joi.object().keys({
    flag: Joi.string()
      .valid(...Object.values(logoutEnum))
      .default(logoutEnum.stayLoggedIn),
  }),
};

const updatePassword = {
  body: logout.body
    .append({
      oldPassword: generalFields.password.required(),
      password: generalFields.password
        .not(Joi.ref("oldPassword"))
        .required()
        .messages({
          "any.invalid": "password can not be the same as oldPassword",
        }),
      confirmPassword: generalFields.confirmPassword.required(),
    })
    .required(),
};

const profileImage = {
  file: Joi.object()
    .keys({
      fieldname: generalFields.fileKeys.fieldname.valid("image"),
      originalname: generalFields.fileKeys.originalname,
      encoding: generalFields.fileKeys.encoding,
      mimetype: generalFields.fileKeys.mimetype.valid(
        ...Object.values(fileValidation.image)
      ),
      basePath: generalFields.fileKeys.basePath,
      finalPath: generalFields.fileKeys.finalPath,
      destination: generalFields.fileKeys.destination,
      filename: generalFields.fileKeys.fieldname,
      path: generalFields.fileKeys.path,
      size: generalFields.fileKeys.size.max(1024 * 512), // 512KB
    })
    .required()
    .messages({
      "any.required": "image field is required with single image file",
    }),
};

const profileCoverImages = {
  files: Joi.array()
    .items(
      Joi.object().keys({
        fieldname: generalFields.fileKeys.fieldname.valid("images"),
        originalname: generalFields.fileKeys.originalname,
        encoding: generalFields.fileKeys.encoding,
        mimetype: generalFields.fileKeys.mimetype.valid(
          ...Object.values(fileValidation.image)
        ),
        basePath: generalFields.fileKeys.basePath,
        finalPath: generalFields.fileKeys.finalPath,
        destination: generalFields.fileKeys.destination,
        filename: generalFields.fileKeys.fieldname,
        path: generalFields.fileKeys.path,
        size: generalFields.fileKeys.size.max(1024 * 1024), // 1MB
      })
    )
    .min(1)
    .max(2)
    .required()
    .messages({
      "any.required":
        "images field is required with mininum 1 image and maximum 2 images",
    }),
};

const userValidators = {
  shareUserProfile,
  updateBasicProfile,
  freezeAccount,
  restoreAccount,
  deleteAccount,
  updatePassword,
  logout,
  profileImage,
  profileCoverImages,
};

export default userValidators;

import UserModel from "../../db/models/user.model.js";
import DBService from "../../db/service.db.js";
import asyncHandler from "../../utils/handlers/async.handler.js";
import successHandler from "../../utils/handlers/success.handler.js";
import { generateLoginCredentials } from "../../utils/security/token.security.js";
import CustomError from "../../utils/custom/error_class.custom.js";
import { encryptText } from "../../utils/security/encrypt.security.js";
import { roleEnum } from "../../utils/constants/enum.constants.js";
import { compareHash, hash } from "../../utils/security/hash.security.js";
import TokenModel from "../../db/models/token.model.js";

export const getUserProfile = asyncHandler(async (req, res, next) => {
  return successHandler({ res, body: req.user });
});

export const shareUserProfile = asyncHandler(async (req, res, next) => {
  const { userId } = req.params || {};

  const user = await DBService.findOne({
    model: UserModel,
    filter: {
      _id: userId,
      confirmEmail: { $exists: true },
    },
  });

  if (!user) {
    throw new CustomError("invalid or not verified account", 404);
  }
  return successHandler({ res, body: user });
});

export const getNewLoginCredentials = asyncHandler(async (req, res, next) => {
  await DBService.create({
    model: TokenModel,
    docs: [
      {
        jti: req.payload.jti,
        expiresIn: req.payload.exp,
        userId: req.payload.id,
      },
    ],
  });

  const credentials = generateLoginCredentials({ user: req.user });
  return successHandler({
    res,
    body: credentials,
  });
});

export const updateBasicProfile = asyncHandler(async (req, res, next) => {
  const { fullName, phone, gender } = req.body;

  let encryptedPhone;
  if (phone) {
    encryptedPhone = encryptText({
      plainText: phone,
      secretKey: process.env.SECRETE_KEY,
    });
  }

  const [firstName, lastName] = fullName?.split(" ") || [];

  const user = await DBService.findOneAndUpdate({
    model: UserModel,
    filter: {
      _id: req.user.id,
      confirmEmail: { $exists: true },
    },
    update: {
      firstName,
      lastName,
      phone: encryptedPhone,
      gender: gender,
    },
  });
  return successHandler({ res, message: "updated successfully", body: user });
});

export const freezeAccount = asyncHandler(async (req, res, next) => {
  const { userId } = req.params || {};

  if (userId && req.user.role != roleEnum.admin) {
    throw new CustomError("Not authorized to delete other accounts", 403);
  }

  const result = await DBService.updateOne({
    model: UserModel,
    filter: {
      _id: userId || req.user.id,
      deletedAt: { $exists: false },
    },
    update: {
      deletedAt: Date.now(),
      deletedBy: req.user.id,
      $unset: {
        restoredAt: 1,
        restoredBy: 1,
      },
    },
  });
  console.log({ result });

  if (!result.modifiedCount) {
    throw new CustomError("user not found!", 404);
  }
  return successHandler({ res, message: "deleted successfully!" });
});

export const restoreAccount = asyncHandler(async (req, res, next) => {
  const { userId } = req.params || {};

  const result = await DBService.updateOne({
    model: UserModel,
    filter: {
      _id: userId,
      deletedAt: { $exists: true },
      deletedBy: { $ne: userId },
    },
    update: {
      $unset: {
        deletedAt: 1,
        deletedBy: 1,
      },
      restoredAt: Date.now(),
      restoredBy: req.user.id,
    },
  });
  console.log({ result });

  if (!result.modifiedCount) {
    throw new CustomError("invalid account or already restored");
  }
  return successHandler({ res, message: "restored successfully!" });
});

export const deleteAccount = asyncHandler(async (req, res, next) => {
  const { userId } = req.params || {};

  const result = await DBService.deleteOne({
    model: UserModel,
    filter: {
      _id: userId,
      deletedAt: { $exists: true },
    },
  });
  console.log({ result });

  if (!result.deletedCount) {
    throw new CustomError("invalid account", 404);
  }
  return successHandler({ res, message: "deleted successfully!" });
});

export const updatePassword = asyncHandler(async (req, res, next) => {
  const { oldPassword, password } = req.body;

  if (
    !(await compareHash({ text: oldPassword, cipherText: req.user.password }))
  ) {
    throw new CustomError("invalid old password", 400);
  }

  if (req.user.oldPasswords?.length) {
    console.log("checking oldPasswords");

    for (const elementPassword of req.user.oldPasswords) {
      if (
        await compareHash({
          text: password,
          cipherText: elementPassword,
        })
      ) {
        throw new CustomError("this password was used before", 400);
      }
    }
  }

  if (req.user.oldPasswords?.length > 5) {
    await DBService.updateOne({
      model: UserModel,
      filter: {
        _id: req.user.id,
      },
      update: {
        $pop: { oldPasswords: -1 },
      },
    });
  }

  await DBService.updateOne({
    model: UserModel,
    filter: {
      _id: req.user.id,
    },
    update: {
      password: await hash({ plainText: password }),
      $push: { oldPasswords: req.user.password },
    },
  });

  return successHandler({ res, message: "password updated successfully!" });
});

export const logout = asyncHandler(async (req, res, next) => {
  console.log(req.payload);
  /*
  {
  id: '68c3062977f38e8137f81537',
  iat: 1757631142,
  exp: 1757632942,
  jti: 'eombPmxSvO1UtebBDhRUi'
 }
  */
  await DBService.create({
    model: TokenModel,
    docs: [
      {
        jti: req.payload.jti,
        expiresIn:
          req.payload.iat + Number(process.env.REFRESH_TOKEN_EXPIRES_IN),
        userId: req.payload.id,
      },
    ],
  });

  return successHandler({
    res,
    statusCode: 201,
    message: "logout successfully!",
  });
});

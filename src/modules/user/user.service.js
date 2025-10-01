import UserModel from "../../db/models/user.model.js";
import DBService from "../../db/service.db.js";
import asyncHandler from "../../utils/handlers/async.handler.js";
import successHandler from "../../utils/handlers/success.handler.js";
import {
  generateLoginCredentials,
  revokeToken,
} from "../../utils/security/token.security.js";
import CustomError from "../../utils/custom/error_class.custom.js";
import { encryptText } from "../../utils/security/encrypt.security.js";
import {
  logoutEnum,
  providerEnum,
  roleEnum,
} from "../../utils/constants/enum.constants.js";
import { compareHash, hash } from "../../utils/security/hash.security.js";
import TokenModel from "../../db/models/token.model.js";
import {
  cloudinaryDeleteFile,
  cloudinaryDeleteFiles,
  cloudinaryDeleteFolder,
  cloudinaryUploadFile,
  cloudinaryUploadFiles,
} from "../../utils/multer/cloudinary.js";
import paginationHandler from "../../utils/handlers/pagination.handler.js";
import userEvents from "../../utils/events/delete_user_messages.event.js";

export const getUserProfile = asyncHandler(async (req, res, next) => {
  const user = await DBService.findById({
    model: UserModel,
    id: req.user.id,
    // populate: [
    //   { path: "messages", select: "id content attachments -receiverId" },
    // ],
  });
  //user.messages = user.messages?.map((message) => message.toJSON());
  return successHandler({ res, body: user });
});

export const shareUserProfile = asyncHandler(async (req, res, next) => {
  const profileLInk = `${req.protocol}://${req.host}/users/${req.user.id}`;

  return successHandler({
    res,
    message: "Profile Link Retrieved Successfully!",
    body: profileLInk,
  });
});

export const getAllUsers = asyncHandler(async (req, res, next) => {
  let { pageSize, page } = req.validationValue.query;

  const result = await paginationHandler({
    model: UserModel,
    filter: { confirmEmail: { $exists: true } },
    pageSize,
    page,
    sort: { createdAt: -1 },
  });

  if (!result.dataItems?.length) {
    throw new CustomError("No accounts found", 404);
  }
  return successHandler({
    res,
    body: {
      pageSize,
      page,
      tatalPages: result.totalPages,
      total: result.totalCount,
      users: result.dataItems,
    },
  });
});

export const getUserById = asyncHandler(async (req, res, next) => {
  const { userId } = req.params || {};

  const user = await DBService.findOne({
    model: UserModel,
    filter: {
      _id: userId,
      confirmEmail: { $exists: true },
      deletedAt: { $exists: false },
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
      changeCredentialsTime: Date.now(),
      $unset: {
        restoredAt: 1,
        restoredBy: 1,
      },
    },
  });

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

  if (!result.modifiedCount) {
    throw new CustomError("invalid account or already restored");
  }
  return successHandler({ res, message: "restored successfully!" });
});

export const deleteAccount = asyncHandler(async (req, res, next) => {
  const { userId } = req.params || {};

  const user = await DBService.findOne({
    model: UserModel,
    filter: { _id: userId, deletedAt: { $exists: true } },
  });

  if (!user) {
    throw new CustomError("invalid account", 404);
  }

  await cloudinaryDeleteFolder({
    path: `user/${userId}`,
    isThereCoverImages: user?.coverImages?.length,
    isThereProfilePicture:
      user?.profilePicture?.public_id &&
      user.profilePicture.public_id != providerEnum.google,
  }).catch((error) => {
    throw new CustomError(
      "error deleting user files, please try again later",
      500
    );
  });

  userEvents.emit("userHardDeleted", user.id);
  await DBService.deleteOne({
    model: UserModel,
    filter: {
      _id: user.id,
    },
  });

  return successHandler({ res, message: "deleted successfully!" });
});

export const updatePassword = asyncHandler(async (req, res, next) => {
  const { oldPassword, password, flag } = req.body;

  if (
    !(await compareHash({ text: oldPassword, cipherText: req.user.password }))
  ) {
    throw new CustomError("invalid old password", 400);
  }

  if (req.user.oldPasswords?.length) {
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

  let updateObject = {};

  switch (flag) {
    case logoutEnum.logoutFromAll:
      updateObject.changeCredentialsTime = Date.now();
      break;

    case logoutEnum.logout:
      await revokeToken({ payload: req.payload });
      break;
    default:
      break;
  }

  await DBService.updateOne({
    model: UserModel,
    filter: {
      _id: req.user.id,
    },
    update: {
      password: await hash({ plainText: password }),
      ...updateObject,
      $push: { oldPasswords: req.user.password },
    },
  });

  return successHandler({ res, message: "password updated successfully!" });
});

export const logout = asyncHandler(async (req, res, next) => {
  const { flag } = req.body || {};
  /*
  {
  id: '68c3062977f38e8137f81537',
  iat: 1757631142,
  exp: 1757632942,
  jti: 'eombPmxSvO1UtebBDhRUi'
 }
  */
  let statusCode = 200;
  switch (flag) {
    case logoutEnum.logoutFromAll:
      await DBService.updateOne({
        model: UserModel,
        filter: {
          _id: req.user.id,
        },
        update: {
          changeCredentialsTime: Date.now(),
        },
      });
      break;

    default:
      await revokeToken({ payload: req.payload });
      statusCode = 201;
      break;
  }

  return successHandler({
    res,
    statusCode,
    message: "logout successfully!",
  });
});

export const updateProfileImage = asyncHandler(async (req, res, next) => {
  // if (req.user?.profilePicture) {
  //   await fs.unlink(path.resolve("./src/" + req.user.profilePicture));
  // }
  // const user = await DBService.findOneAndUpdate({
  //   model: UserModel,
  //   filter: { _id: req.user.id },
  //   update: {
  //     profilePicture: req.file.finalPath,
  //   },
  // });
  // user.profilePicture = user.getImageUrl(req, user.profilePicture);

  const { secure_url, public_id } = await cloudinaryUploadFile({
    file: req.file,
    path: `user/${req.user.id}`,
  });

  const user = await DBService.findOneAndUpdate({
    model: UserModel,
    filter: { _id: req.user.id },
    update: {
      profilePicture: { secure_url, public_id },
    },
  });
  if (
    req.user?.profilePicture?.public_id &&
    req.user.profilePicture.public_id != providerEnum.google
  ) {
    // delete old image from cloudinary
    await cloudinaryDeleteFile({
      public_id: req.user.profilePicture.public_id,
    });
  }
  return successHandler({ res, body: user });
});
export const updateProfileCoverImages = asyncHandler(async (req, res, next) => {
  // if (req.user?.coverImages && req.files) {
  //   await Promise.all(
  //     req.user.coverImages.map((filePath) =>
  //       fs.unlink(path.resolve("./src/" + filePath))
  //     )
  //   );
  // }
  // const user = await DBService.findOneAndUpdate({
  //   model: UserModel,
  //   filter: { _id: req.user.id },
  //   update: {
  //     coverImages: req.files?.map((file) => file.finalPath),
  //   },
  // });
  // user.coverImages = user.coverImages?.map((filePath) =>
  //   user.getImageUrl(req, filePath)
  // );
  // user.profilePicture = user.getImageUrl(req, user.profilePicture);

  const attachments = await cloudinaryUploadFiles({
    files: req.files,
    path: `user/${req.user.id}/coverImages`,
  });

  const user = await DBService.findOneAndUpdate({
    model: UserModel,
    filter: { _id: req.user.id },
    update: {
      coverImages: attachments,
    },
  });

  if (req.user?.coverImages?.length) {
    // delete old images from cloudinary
    await cloudinaryDeleteFiles({
      public_ids: req.user.coverImages.map((file) => file.public_id),
    });
  }

  return successHandler({ res, body: user });
});

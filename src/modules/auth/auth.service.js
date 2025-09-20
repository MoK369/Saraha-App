import UserModel from "../../db/models/user.model.js";
import CustomError from "../../utils/custom/error_class.custom.js";
import { compareHash, hash } from "../../utils/security/hash.security.js";
import { encryptText } from "../../utils/security/encrypt.security.js";
import successHandler from "../../utils/handlers/success.handler.js";
import DBService from "../../db/service.db.js";
import { generateLoginCredentials } from "../../utils/security/token.security.js";
import asyncHandler from "../../utils/handlers/async.handler.js";
import { providerEnum } from "../../utils/constants/enum.constants.js";
import { verifyGoogleAccount } from "../../utils/security/google_token.security.js";
import emailEvent from "../../utils/events/email.event.js";
import { customAlphabet } from "nanoid";

export const signup = asyncHandler(async (req, res, next) => {
  let { fullName, email, password, phone, gender } = req.body || {};

  if (email) {
    if (await DBService.findOne({ model: UserModel, filter: { email } })) {
      throw new CustomError("email already exists", 409);
    }
  }

  if (password) {
    password = await hash({ plainText: password });
  }
  if (phone) {
    phone = encryptText({
      plainText: phone,
      secretKey: process.env.SECRETE_KEY,
    });
  }

  const otp = customAlphabet("0123456789", 6)();
  const confirmEmailOtp = await hash({ plainText: otp });

  await DBService.create({
    model: UserModel,
    docs: [
      {
        fullName,
        email,
        password,
        phone,
        gender,
        confirmEmailOtp,
        confirmEmailOtpCreatedAt: Date.now(),
      },
    ],
  });

  emailEvent.emit("confirmEmail", { to: email, otp });
  return successHandler({
    res,
    statusCode: 201,
    message: "user created! Verification OTP will be sent",
  });
});

export const signin = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body || {};

  if (!email || !password) {
    throw new CustomError("email and password are required");
  }

  const user = await DBService.findOne({
    model: UserModel,
    filter: {
      email,
      provider: providerEnum.system,
      deletedAt: { $exists: false },
    },
  });
  if (!user) {
    throw new CustomError("wrong email or password", 404);
  }
  if (!user.confirmEmail) {
    throw new CustomError("please verify your email");
  }

  if (
    !(await compareHash({
      text: password,
      cipherText: user.password,
    }))
  ) {
    throw new CustomError("wrong email or password", 404);
  }

  const credentials = generateLoginCredentials({ user });
  return successHandler({
    res,
    message: "signed in successfully!",
    body: {
      ...credentials,
      user,
    },
  });
});

export const confirmEmail = asyncHandler(async (req, res, next) => {
  const { email, otp } = req.body;

  const user = await DBService.findOne({
    model: UserModel,
    filter: {
      email,
      confirmEmail: { $exists: false },
      confirmEmailOtp: { $exists: true },
      confirmEmailOtpCreatedAt: { $exists: true },
    },
  });

  if (!user) {
    throw new CustomError("invalid accout or already verified");
  }

  if (!(await compareHash({ text: otp, cipherText: user.confirmEmailOtp }))) {
    throw new CustomError("invalid otp");
  }

   if (
    user?.confirmEmailOtpCreatedAt &&
    Date.now() > user.confirmEmailOtpCreatedAt.getTime() + 10 * 60 * 1000
  ) {
    throw new CustomError("otp has expired, please request a new one");
  }

  const updatedUser = await DBService.updateOne({
    model: UserModel,
    filter: { email },
    update: {
      confirmEmail: Date.now(),
      $unset: { confirmEmailOtp: true, confirmEmailOtpCreatedAt: true },
      $inc: { __v: 1 },
    },
  });

  if (updatedUser.matchedCount)
    return successHandler({ res, message: "account verified!" });
  else throw new CustomError("failed to verify email");
});

export const resendVerificationOtp = asyncHandler(async (req, res, next) => {
  const { email } = req.body;

  const user = await DBService.findOne({
    model: UserModel,
    filter: {
      email,
      confirmEmail: { $exists: false },
      confirmEmailOtp: { $exists: true },
      confirmEmailOtpCreatedAt: { $exists: true },
    },
  });

  if (!user) {
    throw new CustomError("invalid accout or already verified");
  }

  if (user.confirmEmailOtpCreatedAt) {
    if (
      user?.confirmEmailOtpCounts >= 5 &&
      Date.now() < user.confirmEmailOtpCreatedAt.getTime() + 5 * 60 * 1000
    ) {
      throw new CustomError("too many requests, please try after a while", 429);
    }

    Date.now() < user.confirmEmailOtpCreatedAt.getTime() + 3 * 60 * 1000
      ? (user.confirmEmailOtpCounts += 1)
      : (user.confirmEmailOtpCounts = 0);
  }

  const otp = customAlphabet("0123456789", 6)();
  user.confirmEmailOtp = await hash({ plainText: otp });
  user.confirmEmailOtpCreatedAt = Date.now();
  await user.save();

  emailEvent.emit("confirmEmail", { to: email, otp });
  return successHandler({ res, message: "OTP has been sent to this email" });
});

export const signupWithGmail = asyncHandler(async (req, res, next) => {
  const { idToken } = req.body || {};
  if (!idToken) {
    throw new CustomError("idToken is missing");
  }
  console.log({ idToken });

  const { name, email, picture, email_verified } = await verifyGoogleAccount({
    idToken,
  });
  if (!email_verified) {
    throw new CustomError("email not verified");
  }

  const user = await DBService.findOne({ model: UserModel, filter: { email } });
  if (user) {
    if (user.provider == providerEnum.google) {
      return signinWithGmail(req, res, next);
    }
    throw new CustomError("email already exits", 409);
  }
  const [newUser] = await DBService.create({
    model: UserModel,
    docs: [
      {
        fullName: name,
        email,
        picture,
        confirmEmail: Date.now(),
        provider: providerEnum.google,
      },
    ],
  });

  const credentials = generateLoginCredentials({ user: newUser });
  return successHandler({
    res,
    statusCode: 201,
    body: {
      ...credentials,
    },
  });
});
export const signinWithGmail = asyncHandler(async (req, res, next) => {
  const { idToken } = req.body || {};
  if (!idToken) {
    throw new CustomError("idToken is missing");
  }
  console.log({ idToken });

  const { email, email_verified } = await verifyGoogleAccount({
    idToken,
  });
  console.log({ email, email_verified });

  if (!email_verified) {
    throw new CustomError("email not verified");
  }

  const user = await DBService.findOne({
    model: UserModel,
    filter: { email, provider: providerEnum.google },
  });
  if (!user) {
    throw new CustomError("Invalid login data or invalid provider", 404);
  }

  const credentials = generateLoginCredentials({ user });
  return successHandler({
    res,
    body: {
      ...credentials,
    },
  });
});

export const sendForgotPassword = asyncHandler(async (req, res, next) => {
  const { email } = req.body;

  const user = await DBService.findOne({
    model: UserModel,
    filter: {
      email,
      provider: providerEnum.system,
      confirmEmail: { $exists: true },
      deletetAt: { $exists: false },
    },
  });

  if (!user) {
    throw new CustomError("invalid user account", 404);
  }
  const otp = customAlphabet("0123456789", 6)();
  if (user.forgotPasswordOtpCreatedAt) {
    if (
      user.forgotPasswordOtpCounts == 5 &&
      Date.now() < user.forgotPasswordOtpCreatedAt.getTime() + 5 * 60 * 1000
    ) {
      throw new CustomError("too many requests, please try after a while", 429);
    }

    Date.now() < user.forgotPasswordOtpCreatedAt.getTime() + 3 * 60 * 1000
      ? (user.forgotPasswordOtpCounts += 1)
      : (user.forgotPasswordOtpCounts = 0);
  }

  user.forgotPasswordOtp = await hash({ plainText: otp });
  user.forgotPasswordOtpCreatedAt = Date.now();
  user.forgotPasswordOtpVerifiedAt = undefined;
  await user.save();

  emailEvent.emit("forgotPassword", {
    to: email,
    otp,
  });
  return successHandler({ res, message: "OTP has been sent to this email" });
});

export const verifyForgotPassword = asyncHandler(async (req, res, next) => {
  const { email, otp } = req.body;

  const user = await DBService.findOne({
    model: UserModel,
    filter: {
      email,
      provider: providerEnum.system,
      confirmEmail: { $exists: true },
      deletetAt: { $exists: false },
      forgotPasswordOtp: { $exists: true },
    },
  });

  if (!user) {
    throw new CustomError("invalid user account", 404);
  }

  if (
    Date.now() >= user.forgotPasswordOtpCreatedAt.getTime() + 10 * 60 * 1000 ||
    !(await compareHash({ text: otp, cipherText: user.forgotPasswordOtp }))
  ) {
    throw new CustomError("invalid otp or otp has expired");
  }

  await DBService.updateOne({
    model: UserModel,
    filter: { email },
    update: {
      forgotPasswordOtpVerifiedAt: Date.now(),
      $unset: {
        forgotPasswordOtp: 1,
      },
    },
  });

  return successHandler({ res, message: "OTP Verified" });
});

export const restForgotPassword = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  const user = await DBService.findOne({
    model: UserModel,
    filter: {
      email,
      provider: providerEnum.system,
      confirmEmail: { $exists: true },
      deletetAt: { $exists: false },
      forgotPasswordOtp: { $exists: false },
      forgotPasswordOtpVerifiedAt: { $exists: true },
    },
  });

  if (!user) {
    throw new CustomError("invalid user account", 404);
  }

  if (
    Date.now() >=
    user.forgotPasswordOtpVerifiedAt.getTime() + 10 * 60 * 1000
  ) {
    throw new CustomError("otp verification has expired");
  }

  await DBService.updateOne({
    model: UserModel,
    filter: { email },
    update: {
      password: await hash({ plainText: password }),
      changeCredentialsTime: Date.now(),
      $unset: {
        forgotPasswordOtpVerifiedAt: 1,
      },
    },
  });

  return successHandler({ res, message: "Passowrd Reset Successfully!" });
});

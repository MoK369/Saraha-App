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
    password = await hash({ plainText: password, saltRound: 10 });
  }
  if (phone) {
    phone = encryptText({
      plainText: phone,
      secretKey: process.env.SECRETE_KEY,
    });
  }

  const otp = customAlphabet("0123456789", 6)();
  const confirmEmailOtp = await hash({ plainText: otp, saltRound: 10 });

  await DBService.create({
    model: UserModel,
    docs: [{ fullName, email, password, phone, gender, confirmEmailOtp }],
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
    filter: { email, provider: providerEnum.system },
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
  const { email, otp } = req.body || {};

  if (!email || !otp) {
    throw new CustomError("email and otp are required!");
  }

  const user = await DBService.findOne({
    model: UserModel,
    filter: {
      email,
      confirmEmail: { $exists: false },
      confirmEmailOtp: { $exists: true },
    },
  });

  if (!user) {
    throw new CustomError("invalid accout or already verified");
  }

  if (!(await compareHash({ text: otp, cipherText: user.confirmEmailOtp }))) {
    throw new CustomError("invalid otp");
  }
  const updatedUser = await DBService.updateOne({
    model: UserModel,
    filter: { email },
    update: {
      confirmEmail: Date.now(),
      $unset: { confirmEmailOtp: true },
      $inc: { __v: 1 },
    },
  });

  if (updatedUser.matchedCount)
    return successHandler({ res, message: "account verified!" });
  else throw new CustomError("failed to verify email");
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

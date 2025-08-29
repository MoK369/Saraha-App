import UserModel from "../../db/models/user.model.js";
import CustomError from "../../utils/custom/error_class.custom.js";
import { compareHash, hash } from "../../utils/security/hash.security.js";
import { encryptText } from "../../utils/security/encrypt.security.js";
import successHandler from "../../utils/handlers/success.handler.js";
import DBService from "../../db/service.db.js";
import { generateToken } from "../../utils/security/token.security.js";
import asyncHandler from "../../utils/handlers/async.handler.js";

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

  await DBService.create({
    model: UserModel,
    docs: [{ fullName, email, password, phone, gender }],
  });

  return successHandler({ res, statusCode: 201, message: "user created!" });
});

export const signin = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body || {};

  if (!email || !password) {
    throw new CustomError("email and password are required", 400);
  }

  const user = await DBService.findOne({ model: UserModel, filter: { email } });
  if (!user) {
    throw new CustomError("wrong email or password", 404);
  }
  console.log(user);

  if (
    !(await compareHash({
      text: password,
      cipherText: user.password,
    }))
  ) {
    throw new CustomError("wrong email or password", 404);
  }

  const accessToken = generateToken({
    payload: { id: user.id },
    secretKey: process.env.ACCESS_TOKEN_KEY,
  });
  const refreshToken = generateToken({
    payload: { id: user.id },
    secretKey: process.env.REFRESH_TOKEN_KEY,
    options: {
      expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN,
    },
  });
  return successHandler({
    res,
    message: "signed in successfully!",
    body: {
      accessToken,
      refreshToken,
      user,
    },
  });
});

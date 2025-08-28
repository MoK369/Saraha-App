import { asyncHandler } from "../../utils/handlers/async.handler.js";
import UserModel from "../../db/models/user.model.js";
import CustomError from "../../utils/custom/error_class.custom.js";
import { hash } from "../../utils/security/hash.security.js";
import { encryptText } from "../../utils/security/encrypt.security.js";

export const signup = asyncHandler(async (req, res, next) => {
  let { fullName, email, password, phone, gender } = req.body || {};

  if (email) {
    if (await UserModel.findOne({ email })) {
      throw new CustomError("email already exists", 409);
    }
  }

  if (password) {
    password = hash({ text: password, saltRound: 10 });
  }
  if (phone) {
    phone = encryptText({ text: phone, secretKey: process.env.SECRETE_KEY });
  }

  await UserModel.create([{ fullName, email, password, phone, gender }]);

  return res.status(201).json({ success: true, message: "user created!" });
});

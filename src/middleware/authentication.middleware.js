import UserModel from "../db/models/user.model.js";
import DBService from "../db/service.db.js";
import CustomError from "../utils/custom/error_class.custom.js";
import asyncHandler from "../utils/handlers/async.handler.js";
import { verifyToken } from "../utils/security/token.security.js";

const authenticationMiddleware = ({ authOnRefreshToken = false } = {}) => {
  return asyncHandler(async (req, res, next) => {
    const { authorization } = req.headers;

    if (!authorization) {
      throw new CustomError("authorization is misssing", 400);
    }

    const payload = verifyToken({
      token: authorization,
      secretKey: authOnRefreshToken
        ? process.env.REFRESH_TOKEN_KEY
        : process.env.ACCESS_TOKEN_KEY,
    });

    if (!payload?.id) {
      throw new CustomError("Invalid token", 400);
    }

    const user = await DBService.findById({ model: UserModel, id: payload.id });

    if (!user) {
      throw new CustomError("user not found", 404);
    }

    req.user = user;
    next();
  });
};

export default authenticationMiddleware;

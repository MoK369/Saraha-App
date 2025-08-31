import UserModel from "../db/models/user.model.js";
import DBService from "../db/service.db.js";
import { tokenTypeEnum } from "../utils/constants/enum.constants.js";
import CustomError from "../utils/custom/error_class.custom.js";
import asyncHandler from "../utils/handlers/async.handler.js";
import { getTekenKeys, verifyToken } from "../utils/security/token.security.js";

const authenticationMiddleware = ({
  tokenType = tokenTypeEnum.access,
} = {}) => {
  return asyncHandler(async (req, res, next) => {
    const { authorization } = req.headers;

    const [bearerKey, token] = authorization?.split(" ") || [];
    if (!bearerKey || !token) {
      throw new CustomError("missing token parts", 401);
    }
    console.log({ bearerKey, token });

    const tokenKeys = getTekenKeys({ signatureLevel: bearerKey });

    const payload = verifyToken({
      token,
      secretKey:
        tokenType === tokenTypeEnum.refresh
          ? tokenKeys.refreshTokenKey
          : tokenKeys.accessTokenKey,
    });

    if (!payload?.id) {
      throw new CustomError("Invalid token", 401);
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

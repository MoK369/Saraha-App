import TokenModel from "../db/models/token.model.js";
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
    console.log("executing ------------");

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

    if (!payload?.id || !payload?.jti) {
      throw new CustomError("Invalid token", 401);
    }

    if (
      await DBService.findOne({
        model: TokenModel,
        filter: {
          jti: payload.jti,
        },
      })
    ) {
      throw new CustomError("invalid login credentials", 401);
    }

    const user = await DBService.findOne({
      model: UserModel,
      filter: {
        _id: payload.id,
        deletedAt: { $exists: false },
      },
    });

    if (!user) {
      throw new CustomError("user not found", 404);
    }

    req.user = user;
    req.payload = payload;
    console.log(req.user);

    return next();
  });
};

export default authenticationMiddleware;

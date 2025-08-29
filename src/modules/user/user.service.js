import {
  bearerKeyEnum,
  roleEnum,
} from "../../utils/constants/enum.constants.js";
import asyncHandler from "../../utils/handlers/async.handler.js";
import successHandler from "../../utils/handlers/success.handler.js";
import {
  generateToken,
  getTekenKeys,
} from "../../utils/security/token.security.js";

export const getUserProfile = asyncHandler(async (req, res, next) => {
  return successHandler({ res, body: req.user });
});

export const refreshAccessToken = asyncHandler(async (req, res, next) => {
  const signatureLevel =
    req.user.role !== roleEnum.user
      ? bearerKeyEnum.system
      : bearerKeyEnum.bearer;

  const tokenKeys = getTekenKeys({ signatureLevel });

  const accessToken = generateToken({
    payload: { id: req.user.id },
    secretKey: tokenKeys.accessTokenKey,
  });

  const refreshToken = generateToken({
    payload: { id: req.user.id },
    secretKey: tokenKeys.refreshTokenKey,
    options: { expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN },
  });

  return successHandler({
    res,
    body: {
      accessToken,
      refreshToken,
    },
  });
});

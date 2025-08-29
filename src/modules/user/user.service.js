import asyncHandler from "../../utils/handlers/async.handler.js";
import successHandler from "../../utils/handlers/success.handler.js";
import { generateToken } from "../../utils/security/token.security.js";

export const getUserProfile = asyncHandler(async (req, res, next) => {
  return successHandler({ res, body: req.user });
});

export const refreshAccessToken = asyncHandler(async (req, res, next) => {
  const accessToken = generateToken({
    payload: { id: req.user.id },
    secretKey: process.env.ACCESS_TOKEN_KEY,
  });

  const refreshToken = generateToken({
    payload: { id: req.user.id },
    secretKey: process.env.REFRESH_TOKEN_KEY,
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

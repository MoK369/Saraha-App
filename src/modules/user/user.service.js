import asyncHandler from "../../utils/handlers/async.handler.js";
import successHandler from "../../utils/handlers/success.handler.js";
import { generateLoginCredentials } from "../../utils/security/token.security.js";

export const getUserProfile = asyncHandler(async (req, res, next) => {
  return successHandler({ res, body: req.user });
});

export const getNewLoginCredentials = asyncHandler(async (req, res, next) => {
  const credentials = generateLoginCredentials({ user: req.user });

  return successHandler({
    res,
    body: credentials,
  });
});

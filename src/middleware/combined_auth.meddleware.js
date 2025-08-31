import { tokenTypeEnum } from "../utils/constants/enum.constants.js";
import asyncHandler from "../utils/handlers/async.handler.js";
import authenticationMiddleware from "./authentication.middleware.js";
import authorizationMiddleware from "./authorization.middleware.js";

const combinedAuth = ({
  tokenType = tokenTypeEnum.access,
  accessRole = [],
} = {}) => {
  return asyncHandler(async (req, res, next) => {
    await authenticationMiddleware({ tokenType })(req, res, next);
    await authorizationMiddleware({ accessRole })(req, res, next);
  });
};

export default combinedAuth;

import CustomError from "../utils/custom/error_class.custom.js";
import asyncHandler from "../utils/handlers/async.handler.js";

const authorizationMiddleware = ({ accessRole = [] } = {}) => {
  return asyncHandler((req, res, next) => {    
    if (!accessRole.includes(req.user.role)) {
      throw new CustomError("Not Authorized Account", 403);
    }
    return next();
  });
};

export default authorizationMiddleware;

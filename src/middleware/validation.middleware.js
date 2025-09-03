import asyncHandler from "../utils/handlers/async.handler.js";
import { moodEnum } from "../utils/constants/enum.constants.js";

const validationMiddleware = ({ validationSchema }) => {
  return asyncHandler(async (req, res, next) => {
    const errorObject = {};

    for (const key of Object.keys(validationSchema)) {
      const validationResult = validationSchema[key].validate(req[key], {
        abortEarly: false,
      });
      if (validationResult.error) {
        errorObject[key] = process.env.MOOD == moodEnum.production
          ? validationResult.error.message
          : validationResult.error.details;
      }
    }
    console.log(errorObject);

    if (Object.values(errorObject).length) {
      return next(errorObject);
    }

    next();
  });
};

export default validationMiddleware;

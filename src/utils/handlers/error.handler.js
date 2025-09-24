import ConstantValues from "../constants/values.constants.js";

const errorHandler = (error, req, res, next) => {
  // console.log({ error });
  // console.log({ errorName: error.name });
  // console.log({ errorMessage: error.message });
  let statusCode;
  switch (error.name) {
    case "ValidationError":
    case "SyntaxError":
      statusCode = 400;
      break;
    case "TokenExpiredError":
    case "JsonWebTokenError":
      statusCode = 401;
      error.message = "Invalid Token";
      break;
    case ConstantValues.customError:
      statusCode = error.statusCode;
      break;
    default:
      statusCode = 500;
      break;
  }
  return res
    .status(statusCode)
    .json({ success: false, errorMessage: error.message, error });
};

export default errorHandler;

import ConstantValues from "../constants/values.constants.js";

const errorHandler = (error, req, res, next) => {
  console.log({ error });
  console.log({ errorName: error.name });
  console.log({ errorMessage: error.message });
  if (error.name == "ValidationError" || error.name == "SyntaxError") {
    return res.status(400).json({ success: false, error: error.message });
  }
  if (error.name == ConstantValues.customError) {
    return res
      .status(error.statusCode)
      .json({ success: false, error: error.message });
  }
  return res.status(500).json({ success: false, error: error.message });
};

export default errorHandler;

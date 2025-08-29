import jwt from "jsonwebtoken";
import { bearerKeyEnum } from "../constants/enum.constants.js";

export const generateToken = ({
  payload,
  secretKey,
  options = {
    expiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN,
  },
}) => {
  return jwt.sign(payload, secretKey, options);
};

export const verifyToken = ({ token, secretKey, options }) => {
  return jwt.verify(token, secretKey, options);
};

export const getTekenKeys = ({ signatureLevel } = {}) => {
  const tokenKeys = { accessTokenKey: undefined, refreshTokenKey: undefined };
  switch (signatureLevel) {
    case bearerKeyEnum.system:
      tokenKeys.accessTokenKey = process.env.ACCESS_ADMIN_TOKEN_KEY;
      tokenKeys.refreshTokenKey = process.env.REFRESH_ADMIN_TOKEN_KEY;
      break;
    case bearerKeyEnum.bearer:
      tokenKeys.accessTokenKey = process.env.ACCESS_USER_TOKEN_KEY;
      tokenKeys.refreshTokenKey = process.env.REFRESH_USER_TOKEN_KEY;
      break;
    default:
      break;
  }
  return tokenKeys;
};

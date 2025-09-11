import jwt from "jsonwebtoken";
import { bearerKeyEnum, roleEnum } from "../constants/enum.constants.js";
import { nanoid } from "nanoid";

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

export const generateLoginCredentials = ({ user } = {}) => {
  const signatureLevel =
    user.role !== roleEnum.user ? bearerKeyEnum.system : bearerKeyEnum.bearer;

  const tokenKeys = getTekenKeys({ signatureLevel });
  const jwtid = nanoid();
  const accessToken = generateToken({
    payload: { id: user.id },
    secretKey: tokenKeys.accessTokenKey,
    options: {
      jwtid,
      expiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN,
    },
  });

  const refreshToken = generateToken({
    payload: { id: user.id },
    secretKey: tokenKeys.refreshTokenKey,
    options: { jwtid, expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN },
  });

  return { accessToken, refreshToken };
};

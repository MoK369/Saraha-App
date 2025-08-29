import jwt from "jsonwebtoken";

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

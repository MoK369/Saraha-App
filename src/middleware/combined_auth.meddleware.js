import { tokenTypeEnum } from "../utils/constants/enum.constants.js";
import authenticationMiddleware from "./authentication.middleware.js";
import authorizationMiddleware from "./authorization.middleware.js";

const combinedAuth = ({
  tokenType = tokenTypeEnum.access,
  accessRole = [],
} = {}) => {
  return [
    authenticationMiddleware({ tokenType }),
    authorizationMiddleware({ accessRole }),
  ];
};

export default combinedAuth;

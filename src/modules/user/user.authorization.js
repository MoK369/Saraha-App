import { roleEnum } from "../../utils/constants/enum.constants.js";

const endpointAuth = {
  restoreAccount: roleEnum.admin,
  deleteAccount: roleEnum.admin,
  getAllUsers: roleEnum.admin,
};

export default endpointAuth;

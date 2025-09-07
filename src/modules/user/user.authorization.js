import { roleEnum } from "../../utils/constants/enum.constants.js";
import { deleteAccount } from "./user.service.js";

const endpointAuth = {
  restoreAccount: roleEnum.admin,
  deleteAccount: roleEnum.admin
};

export default endpointAuth;

import { roleEnum } from "../../utils/constants/enum.constants.js";

const endpointAuth = {
  hardDeleteMessage: roleEnum.admin,
  restoreMessage: roleEnum.admin,
  getUserMessages: roleEnum.admin,
};

export default endpointAuth;
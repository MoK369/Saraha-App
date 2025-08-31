import { roleEnum } from "../../utils/constants/enum.constants.js";

const endpointAuth = {
  profile: Object.values(roleEnum),
  refreshToken: Object.values(roleEnum),
};

export default endpointAuth;

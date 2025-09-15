import Joi from "joi";
import generalFields from "../../utils/constants/fields_validation.constants.js";
import { logoutEnum } from "../../utils/constants/enum.constants.js";

const shareUserProfile = {
  params: Joi.object().keys({
    userId: generalFields.objectId.required(),
  }),
};

const updateBasicProfile = {
  body: Joi.object()
    .keys({
      fullName: generalFields.fullName,
      phone: generalFields.phone,
      gender: generalFields.gender,
    })
    .required()
    .messages({
      "any.required": "missing body data",
    }),
};

const freezeAccount = {
  params: Joi.object().keys({
    userId: generalFields.objectId,
  }),
};

const restoreAccount = {
  params: Joi.object().keys({
    userId: generalFields.objectId.required(),
  }),
};

const deleteAccount = {
  params: Joi.object().keys({
    userId: generalFields.objectId.required(),
  }),
};

const logout = {
  body: Joi.object().keys({
    flag: Joi.string()
      .valid(...Object.values(logoutEnum))
      .default(logoutEnum.stayLoggedIn),
  }),
};

const updatePassword = {
  body: logout.body
    .append({
      oldPassword: generalFields.password.required(),
      password: generalFields.password
        .not(Joi.ref("oldPassword"))
        .required()
        .messages({
          "any.invalid": "password can not be the same as oldPassword",
        }),
      confirmPassword: generalFields.confirmPassword.required(),
    })
    .required(),
};

const userValidators = {
  shareUserProfile,
  updateBasicProfile,
  freezeAccount,
  restoreAccount,
  deleteAccount,
  updatePassword,
  logout,
};

export default userValidators;

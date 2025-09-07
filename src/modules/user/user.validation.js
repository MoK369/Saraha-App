import Joi from "joi";
import generalFields from "../../utils/constants/fields_validation.constants.js";
import { genderEnum } from "../../utils/constants/enum.constants.js";

const profile = {
  headers: Joi.object()
    .keys({
      authorization: generalFields.authorization.required(),
    })
    .unknown(true),
};

const refeshToken = {
  headers: Joi.object()
    .keys({
      authorization: generalFields.authorization.required(),
    })
    .unknown(true),
};

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

const userValidators = {
  profile,
  refeshToken,
  shareUserProfile,
  updateBasicProfile,
  freezeAccount,
  restoreAccount,
  deleteAccount
};

export default userValidators;

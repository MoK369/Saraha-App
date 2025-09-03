import Joi from "joi";
import generalFields from "../../utils/constants/fields_validation.constants.js";

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
}

const userValidators = { profile,refeshToken };

export default userValidators;

import Joi from "joi";
import generalFields from "../../utils/constants/fields_validation.constants.js";

const signin = {
  body: Joi.object()
    .keys({
      email: generalFields.email.required(),
      password: generalFields.password.required(),
    })
    .required(),
};

const signup = {
  body: signin.body
    .append({
      fullName: generalFields.fullName.required(),
      phone: generalFields.phone.required(),
      confirmPassword: generalFields.confirmPassword.required(),
    })
    .required()
    .messages({
      "any.only": "confirmPassword must be the same as password",
    }),
};

const confirmEmail = {
  body: Joi.object()
    .keys({
      email: generalFields.email.required(),
      otp: generalFields.otp.required(),
    })
    .required(),
};

const signWithGmail = {
  body: Joi.object().keys({
    idToken: generalFields.token.required(),
  }),
};

const AuthValidators = { signin, signup, confirmEmail, signWithGmail };

export default AuthValidators;

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

const resendVerificationOtp = {
  body: Joi.object()
    .keys({
      email: generalFields.email.required(),
    })
    .required(),
};

const signWithGmail = {
  body: Joi.object().keys({
    idToken: generalFields.token.required(),
  }),
};

const forgotPassword = {
  body: Joi.object()
    .keys({
      email: generalFields.email.required(),
    })
    .required(),
};

const veifyForgotPassword = {
  body: forgotPassword.body
    .append({
      otp: generalFields.otp.required(),
    })
    .required(),
};

const resetForgotPassword = {
  body: forgotPassword.body
    .append({
      password: generalFields.password.required(),
      confirmPassword: generalFields.confirmPassword.required(),
    })
    .required(),
};

const sendRestoreAccount = {
  body: Joi.object()
    .keys({
      email: generalFields.email.required(),
    })
    .required(),
};


const restoreAccount = {
  body: forgotPassword.body
    .append({
      otp: generalFields.otp.required(),
    })
    .required(),
};

const AuthValidators = {
  signin,
  signup,
  confirmEmail,
  resendVerificationOtp,
  signWithGmail,
  forgotPassword,
  veifyForgotPassword,
  resetForgotPassword,
  sendRestoreAccount,
  restoreAccount,
};

export default AuthValidators;

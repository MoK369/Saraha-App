import { Router } from "express";
import * as authService from "./auth.service.js";
import validationMiddleware from "../../middleware/validation.middleware.js";
import AuthValidators from "./auth.validation.js";

const authRouter = Router();

authRouter.post(
  "/signup",
  validationMiddleware({ validationSchema: AuthValidators.signup }),
  authService.signup
);
authRouter.post(
  "/signin",
  validationMiddleware({ validationSchema: AuthValidators.signin }),
  authService.signin
);
authRouter.post(
  "/resend-verification-otp",
  validationMiddleware({ validationSchema: AuthValidators.resendVerificationOtp }),
  authService.resendVerificationOtp
);
authRouter.patch(
  "/confirm-email",
  validationMiddleware({ validationSchema: AuthValidators.confirmEmail }),
  authService.confirmEmail
);
authRouter.post(
  "/signup-with-gmail",
  validationMiddleware({ validationSchema: AuthValidators.signWithGmail }),
  authService.signupWithGmail
);
authRouter.post(
  "/signin-with-gmail",
  validationMiddleware({ validationSchema: AuthValidators.signWithGmail }),
  authService.signinWithGmail
);
authRouter.post(
  "/forgot-password",
  validationMiddleware({ validationSchema: AuthValidators.forgotPassword }),
  authService.sendForgotPassword
);

authRouter.post(
  "/verify-forgot-password",
  validationMiddleware({ validationSchema: AuthValidators.veifyForgotPassword }),
  authService.verifyForgotPassword
);

authRouter.post(
  "/reset-forgot-password",
  validationMiddleware({ validationSchema: AuthValidators.resetForgotPassword }),
  authService.restForgotPassword
);

export default authRouter;

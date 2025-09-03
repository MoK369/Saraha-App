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

export default authRouter;

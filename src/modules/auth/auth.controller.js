import { Router } from "express";
import * as authService from "./auth.service.js";

const authRouter = Router();

authRouter.post("/signup", authService.signup);
authRouter.post("/signup-with-gmail", authService.signupWithGmail);
authRouter.post("/signin", authService.signin);
authRouter.post("/signin-with-gmail", authService.signinWithGmail);


export default authRouter;
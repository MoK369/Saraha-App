import { Router } from "express";
import * as authService from "./auth.service.js";

const authRouter = Router();

authRouter.post("/signup", authService.signup);
authRouter.post("/signin", authService.signin);


export default authRouter;
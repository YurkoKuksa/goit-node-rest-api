import express from "express";
import authController from "../controllers/authController.js";
import validateBody from "../helpers/validateBody.js";
import authenticate from "../middlewares/authenticate.js";

import {
  userSignupSchema,
  userSigninSchema,
  userSubscription,
} from "../schemas/usersSchemas.js";

const authRouter = express.Router();

authRouter.post(
  "/signin",
  validateBody(userSigninSchema),
  authController.signin
);

authRouter.post(
  "/signup",
  validateBody(userSignupSchema),
  authController.signup
);

authRouter.get("/current", authenticate, authController.getCurrent);
authRouter.post("/signout", authenticate, authController.signout);

authRouter.patch(
  "/",
  authenticate,
  validateBody(userSubscription),
  authController.updateSubscription
);

export default authRouter;

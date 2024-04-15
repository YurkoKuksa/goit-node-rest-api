import Joi from "joi";

export const userSignupSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  subscription: Joi.string(),
});

export const userSigninSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

export const userSubscription = Joi.object({
  subscription: Joi.string().valid("starter", "pro", "business").required(),
});

export const userEmailSchema = Joi.object({
  email: Joi.string().required(),
});

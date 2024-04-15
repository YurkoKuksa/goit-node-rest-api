import bcrypt from "bcrypt";
import { ctrlWrapper } from "../helpers/ctrlWrapper.js";
import HttpError from "../helpers/HttpError.js";
import {
  findUser,
  validatePassword,
  createUser,
  updateUser,
} from "../services/authServices.js";
import jwt from "jsonwebtoken";
import gravatar from "gravatar";
import path from "path";
import fs from "fs/promises";
import jimp from "jimp";
import { nanoid } from "nanoid";

import { sendEmail } from "../helpers/sendEmail.js";

const { JWT_SECRET, BASE_URL } = process.env;

const signup = async (req, res) => {
  const { email } = req.body;
  const user = await findUser({ email: email });

  if (user) {
    throw HttpError(409, "Email in use");
  }

  const hashPassword = await bcrypt.hash(password, 10);
  const avatarURL = gravatar.url(email);
  const verificationToken = nanoid();

  const newUser = await createUser({
    ...req.body,
    password: hashPassword,
    avatarURL,
    verificationToken,
  });

  // res.status(201).json({
  //   user: {
  //     email: newUser.email,
  //     subscription: newUser.subscription,
  //     avatarURL,
  //     verificationToken,
  //   },
  // });

  const verifyEmail = {
    to: email,
    subject: "Verify email",
    html: `<a target = "_blank" href="${BASE_URL}/api/users/verify/${verificationToken}">Click verify email</a>`,
  };

  await sendEmail(verifyEmail);

  res.status(201).json({
    user: { email: newUser.email, subscription: newUser.subscription },
  });
};

const signin = async (req, res) => {
  const { email, password } = req.body;
  const user = await findUser({ email: email });

  if (!user) {
    throw HttpError(401, "Email or password is wrong");
  }
  const comparePassword = await validatePassword(password, user.password);

  if (!comparePassword) {
    throw HttpError(401, "Email or password is wrong");
  }

  const { _id: id } = user;

  const payload = { id };

  const token = jwt.sign(payload, JWT_SECRET, { expiresIn: "23h" });
  await updateUser({ _id: id }, { token });

  res.json({
    token: token,
    user: { email: user.email, subscription: user.subscription },
  });
};

const getCurrent = async (req, res) => {
  const { email, subscription } = req.user;

  res.json({
    email,
    subscription,
  });
};

const signout = async (req, res) => {
  const { _id } = req.user;
  await updateUser({ _id }, { token: "" });

  res.status(204).json();
};

const updateSubscription = async (req, res) => {
  const { _id, email } = req.user;
  const { subscription } = req.body;
  await updateUser(_id, { subscription });

  res.json({
    email,
    subscription,
  });
};

const avatarsDir = path.join("public", "avatars");

const updateAvatar = async (req, res) => {
  const { _id } = req.user;
  const { path: tmpUpload, originalname } = req.file;
  const extention = originalname.split(".").pop();
  const filename = `${_id}.${extention}`;
  const resultUpload = path.join(avatarsDir, filename);

  const image = await jimp.read(tmpUpload);
  await image.cover(250, 250).quality(90).writeAsync(tmpUpload);

  await fs.rename(tmpUpload, resultUpload);

  const avatarURL = path.join("avatars", filename);

  await updateUser(_id, { avatarURL });

  res.json({ avatarURL });
};

export const verifyEmail = async (req, res) => {
  const { verificationToken } = req.params;
  const user = await findUser({ verificationToken });

  if (!user) {
    throw HttpError(401, "Email not found");
  }

  await updateUser(user._id, { verify: true, verificationToken: null });

  res.json({
    message: "Verification successful",
  });
};

export const resendVerifyEmail = async (req, res) => {
  const { email } = req.body;
  const user = await findUser({ email });

  if (!user) {
    throw HttpError(401, "Email not found");
  }

  if (user.verify) {
    throw HttpError(400, "Verification has already been passed");
  }

  const verifyEmail = {
    to: email,
    subject: "Please, verify email",
    html: `<a target = "_blank" href="${BASE_URL}/api/users/verify/${user.verificationToken}">Click to verify email</a>`,
  };

  await sendEmail(verifyEmail);

  res.json({
    message: "Verification email sent",
  });
};

export default {
  signup: ctrlWrapper(signup),
  signin: ctrlWrapper(signin),
  getCurrent: ctrlWrapper(getCurrent),
  signout: ctrlWrapper(signout),
  updateSubscription: ctrlWrapper(updateSubscription),
  updateAvatar: ctrlWrapper(updateAvatar),
  verifyEmail: ctrlWrapper(verifyEmail),
  resendVerifyEmail: ctrlWrapper(resendVerifyEmail),
};

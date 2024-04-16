import bcrypt from "bcrypt";
import User from "../models/User.js";

export const findUser = (filter) => User.findOne(filter);

export const createUser = async (body) => {
  const newUser = await User.create(body);

  return newUser;
};

export const updateUser = async (id, data) =>
  User.findByIdAndUpdate(id, data, { new: true });

export const validatePassword = (password, hashPassword) =>
  bcrypt.compare(password, hashPassword);

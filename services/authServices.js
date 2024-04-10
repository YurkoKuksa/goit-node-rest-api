import bcrypt from "bcrypt";
import User from "../models/User.js";

export const findUser = (filter) => User.findOne(filter);

export const createUser = async (data) => {
  const hashPassword = await bcrypt.hash(data.password, 10);
  return User.create({ ...data, password: hashPassword });
};

export const updateUser = async (id, data) =>
  User.findByIdAndUpdate(id, data, { new: true });

export const validatePassword = (password, hashPassword) =>
  bcrypt.compare(password, hashPassword);

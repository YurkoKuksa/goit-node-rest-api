import { nanoid } from "nanoid";
import path from "path";
import fs from "fs/promises";
import { Contact } from "../models/Сontact.js";

export const contactsPath = path.join("db", "contacts.json");

export async function listContacts() {
  const data = await Contact.find({});
  return data;
}

export async function getContactById(id) {
  const contact = await Contact.findById(id);
  return contact || null;
}

export async function removeContact(id) {
  const deleteContact = await Contact.findByIdAndDelete(id);
  return deleteContact;
}

export async function addContact(body) {
  const newContact = await Contact.create(body);
  return newContact;
}

export async function updateContactById(id, data) {
  const contact = await Contact.findByIdAndUpdate(id, data, { new: true });
  return contact;
}

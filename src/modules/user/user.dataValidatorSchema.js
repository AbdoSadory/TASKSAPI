import joi from "joi"
import { Types } from "mongoose"

const objectIdValidation = (value, helper) => {
  const isValid = Types.ObjectId.isValid(value)
  return isValid ? value : helper.message("Invalid MongoDB ObjectId")
}

export const signUpSchema = {
  body: joi.object({
    username: joi.string().trim().min(3).required(),
    email: joi.string().email().trim().required(),
    password: joi.string().trim().alphanum().min(6).required(),
  }),
}

export const loginSchema = {
  body: joi
    .object({
      username: joi.string().trim().min(3).required(),
      password: joi.string().trim().alphanum().min(6).required(),
    })
    .with("username", "password"),
}

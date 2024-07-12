import joi from "joi"
import { Types } from "mongoose"

const objectIdValidation = (value, helper) => {
  const isValid = Types.ObjectId.isValid(value)
  return isValid ? value : helper.message("Invalid MongoDB ObjectId")
}

export const getCategorySchema = {
  params: joi.object({
    categoryId: joi.string().custom(objectIdValidation).required(),
  }),
}

export const createCategorySchema = {
  body: joi.object({
    categoryName: joi.string().trim().min(3).required(),
  }),
}

export const updateCategorySchema = {
  body: joi.object({
    categoryName: joi.string().trim().min(3).required(),
  }),
  params: joi.object({
    categoryId: joi.string().custom(objectIdValidation).required(),
  }),
}

export const deleteCategorySchema = {
  params: joi.object({
    categoryId: joi.string().custom(objectIdValidation).required(),
  }),
}

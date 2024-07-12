import joi from "joi"
import { Types } from "mongoose"

const objectIdValidation = (value, helper) => {
  const isValid = Types.ObjectId.isValid(value)
  return isValid ? value : helper.message("Invalid MongoDB ObjectId")
}

export const getTaskSchema = {
  params: joi.object({
    taskId: joi.string().custom(objectIdValidation).required(),
  }),
}

export const createTaskSchema = {
  body: joi
    .object({
      categoryID: joi.string().custom(objectIdValidation),
      state: joi.string().valid("shared", "private").default("shared"),
      body: {
        bodyType: joi.string().valid("text", "list").required(),
        bodyContent: joi
          .alternatives()
          .conditional("bodyType", {
            is: "text",
            then: joi.string(),
            otherwise: joi.array(),
          })
          .required(),
      },
    })
    .with("body.bodyType", "body.bodyContent"),
}
export const updateTaskSchema = {
  body: joi
    .object({
      categoryID: joi.string().custom(objectIdValidation),
      state: joi.string().valid("shared", "private").default("shared"),
      body: {
        bodyType: joi.string().valid("text", "list"),
        bodyContent: joi.alternatives().conditional("bodyType", {
          is: "text",
          then: joi.string(),
          otherwise: joi.array(),
        }),
      },
    })
    .with("body.bodyType", "body.bodyContent"),
}
export const deleteTaskSchema = {
  params: joi.object({
    taskId: joi.string().custom(objectIdValidation).required(),
  }),
}

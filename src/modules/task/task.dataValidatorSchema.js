import Joi from "joi"
import joiDate from "@joi/date"
import { Types } from "mongoose"

const joi = Joi.extend(joiDate)

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
      shared: joi.string().valid("public", "private").default("public"),
      deadline: joi
        .date()
        .format("YYYY-MM-DD")
        .greater("now")
        .messages({
          "*": "deadline must be in YYYY-MM-DD format and after today",
        })
        .required(),
      status: joi.string().trim().valid("toDo", "doing", "done").required(),
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
      shared: joi.string().valid("public", "private").default("public"),
      deadline: joi.date().format("YYYY-MM-DD").greater("now").messages({
        "*": "deadline must be in YYYY-MM-DD format and after today",
      }),
      status: joi.string().trim().valid("toDo", "doing", "done"),
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

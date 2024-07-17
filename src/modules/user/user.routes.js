import { Router } from "express"
import expressAsyncHandler from "express-async-handler"
import validationMiddleware from "../../middlewares/validationMiddleware.js"
import * as userControllers from "./user.controllers.js"
import * as userDataValidationSchemas from "./user.dataValidatorSchema.js"
import { authHandler } from "../../middlewares/authHandler.js"

const userRouter = Router()

userRouter.post(
  "/signUp",
  validationMiddleware(userDataValidationSchemas.signUpSchema),
  expressAsyncHandler(userControllers.signUp)
)
userRouter.post(
  "/login",
  validationMiddleware(userDataValidationSchemas.loginSchema),
  expressAsyncHandler(userControllers.login)
)
userRouter.put(
  "/",
  authHandler(),
  validationMiddleware(userDataValidationSchemas.updateSchema),
  expressAsyncHandler(userControllers.updateUser)
)
export default userRouter

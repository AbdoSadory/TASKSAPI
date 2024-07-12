import { Router } from "express"
import expressAsyncHandler from "express-async-handler"
import validationMiddleware from "../../middlewares/validationMiddleware.js"
import * as taskControllers from "./task.controllers.js"
import * as taskDataValidationSchemas from "./task.dataValidatorSchema.js"
import { authHandler } from "../../middlewares/authHandler.js"

const taskRouter = Router()

taskRouter.get("/public/all", expressAsyncHandler(taskControllers.getAllTasks))
taskRouter.get(
  "/publictask/:taskId",
  expressAsyncHandler(taskControllers.getSharedTaskById)
)

taskRouter.use(authHandler())
taskRouter.get("/mytasks", expressAsyncHandler(taskControllers.getMyTasks))

taskRouter.post(
  "/",
  validationMiddleware(taskDataValidationSchemas.createTaskSchema),
  expressAsyncHandler(taskControllers.createTask)
)

taskRouter
  .route("/:taskId")
  .get(
    validationMiddleware(taskDataValidationSchemas.getTaskSchema),
    expressAsyncHandler(taskControllers.getTaskById)
  )
  .put(
    validationMiddleware(taskDataValidationSchemas.updateTaskSchema),
    expressAsyncHandler(taskControllers.updateTask)
  )
  .delete(
    validationMiddleware(taskDataValidationSchemas.deleteTaskSchema),
    expressAsyncHandler(taskControllers.deleteTask)
  )

export default taskRouter

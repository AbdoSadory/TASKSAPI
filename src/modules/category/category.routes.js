import { Router } from "express"
import expressAsyncHandler from "express-async-handler"
import validationMiddleware from "../../middlewares/validationMiddleware.js"
import * as categoryControllers from "./category.controllers.js"
import * as categoryDataValidationSchemas from "./category.dataValidatorSchema.js"
import { authHandler } from "../../middlewares/authHandler.js"

const categoryRouter = Router()

categoryRouter.use(authHandler())

categoryRouter.get(
  "/all",
  expressAsyncHandler(categoryControllers.getAllCategories)
)

categoryRouter.get(
  "/",
  expressAsyncHandler(categoryControllers.getCategoryById)
)

categoryRouter.post(
  "/",
  validationMiddleware(categoryDataValidationSchemas.createCategorySchema),
  expressAsyncHandler(categoryControllers.createCategory)
)

categoryRouter
  .route("/:categoryId")
  .get(
    validationMiddleware(categoryDataValidationSchemas.getCategorySchema),
    expressAsyncHandler(categoryControllers.getCategoryById)
  )
  .put(
    validationMiddleware(categoryDataValidationSchemas.updateCategorySchema),
    expressAsyncHandler(categoryControllers.updateCategory)
  )
  .delete(
    validationMiddleware(categoryDataValidationSchemas.deleteCategorySchema),
    expressAsyncHandler(categoryControllers.deleteCategory)
  )

export default categoryRouter

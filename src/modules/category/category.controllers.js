import * as dbMethods from "../../../DB/dbMethods.js"
import CATEGORY from "../../../DB/models/category.model.js"
import TASK from "../../../DB/models/task.model.js"

/**
 * 1- Get _id from req.authUser
 * 2- Find All categories with this user id
 * 3- Respond with the result
 */
export const getAllCategories = async (req, res, next) => {
  // 1- Get _id from req.authUser
  const { _id } = req.authUser

  // 2- Find All categories with this user id
  const categories = await CATEGORY.find({ creator: _id }).populate(
    "category_tasks"
  )

  // 3- Respond with the result
  res.status(200).json({ message: "categories", categories })
}

/**
 * 1- Get _id from req.authUser and category id from req.params
 * 2- Find category with this user id and category id
 * 3- Check Edge Case
 * 4- Respond with the result
 */
export const getCategoryById = async (req, res, next) => {
  // 1- Get _id from req.authUser and category id from req.params
  const { categoryId } = req.params
  const { _id } = req.authUser

  // 2- Find category with this user id and category id
  const getCategory = await CATEGORY.findOne({
    _id: categoryId,
    creator: _id,
  }).populate("category_tasks")

  // 3- Check Edge Case
  if (!getCategory)
    return next(new Error("No Category has been found", { cause: 404 }))

  // 4- Respond with the result
  res.status(200).json({ message: "category", category: getCategory })
}

/**
 * 1- Get categoryName from req.body and _id from req.authUser
 * 2- create new category
 * 3- Check edge cases
 * 4- respond with the new category
 */
export const createCategory = async (req, res, next) => {
  // 1- Get categoryName from req.body and _id from req.authUser
  const { categoryName } = req.body
  const { _id } = req.authUser

  // 2- create new category
  const newCategory = await dbMethods.createDocument(CATEGORY, {
    categoryName,
    creator: _id,
  })

  // 3- Check edge cases
  if (!newCategory.success) {
    return next(new Error(newCategory.message, { cause: newCategory.status }))
  }

  // 4- respond with the new category
  res
    .status(newCategory.status)
    .json({ message: newCategory.message, category: newCategory.result })
}

/**
 * 1-   Get new categoryName from req.body, _id from req.authUser and category ID from params
 * 2-   Find category with categoryId
 * 3-   Check if it's not existed
 * 4-   Check if the category creator is the authenticated user
 * 5-   Update the category with the new categoryName
 * 6-   Respond with the updated category
 */
export const updateCategory = async (req, res, next) => {
  // 1-   Get new categoryName from req.body, _id from req.authUser and category ID from params
  const { categoryName } = req.body
  const { categoryId } = req.params
  const { _id } = req.authUser

  // 2-   Find category with categoryId
  const findCategory = await dbMethods.findByIdDocument(CATEGORY, categoryId)

  // 3-   Check if it's not existed
  if (!findCategory.success)
    return next(new Error(findCategory.message, { cause: findCategory.status }))

  // 4-   Check if the category creator is the authenticated user
  if (findCategory.result.creator.toString() != _id.toString())
    return next(
      new Error("User Must update only his own categories", {
        cause: 403,
      })
    )

  // 5-   Update the category with the new categoryName
  findCategory.result.categoryName = categoryName
  findCategory.result.__v += 1
  await findCategory.result.save()

  //   6-   Respond with the updated category
  res
    .status(findCategory.status)
    .json({ message: findCategory.message, category: findCategory.result })
}

/**
 *
 * 1-   Get _id from req.authUser and category ID from params
 * 2-   Find category with categoryId
 * 3-   Check if it's not existed
 * 4-   Check if the category creator is the authenticated user
 * 5-   Delete the category
 * 6-   Check if it's not deleted
 * 7-   Delete Tasks of this category
 * 8-   Check if it's not deleted
 * 9-   Respond with the status and message
 */
export const deleteCategory = async (req, res, next) => {
  // 1-   Get _id from req.authUser and category ID from params
  const { categoryId } = req.params
  const { _id } = req.authUser

  // 2-   Find category with categoryId
  const findCategory = await dbMethods.findByIdDocument(CATEGORY, categoryId)

  // 3-   Check if it's not existed
  if (!findCategory.success)
    return next(new Error(findCategory.message, { cause: findCategory.status }))

  // 4-   Check if the category creator is the authenticated user
  if (findCategory.result.creator.toString() != _id.toString())
    return next(
      new Error("User Must delete only his own categories", {
        cause: 403,
      })
    )

  // 5-   Delete the category
  const deleteCategory = await dbMethods.findByIdAndDeleteDocument(
    CATEGORY,
    categoryId
  )

  // 6-   Check if it's not deleted
  if (!deleteCategory.success)
    return next(
      new Error(deleteCategory.message, { cause: deleteCategory.status })
    )

  // 7-   Delete Tasks of this category
  const deleteCategoryTasks = await dbMethods.deleteManyDocument(TASK, {
    categoryID: categoryId,
  })
  // 8-   Check if it's not deleted
  if (!deleteCategoryTasks.success)
    return next(
      new Error(deleteCategoryTasks.message, {
        cause: deleteCategoryTasks.status,
      })
    )

  // 9-   Respond with the status and message
  res.status(deleteCategory.status).json({ message: deleteCategory.message })
}

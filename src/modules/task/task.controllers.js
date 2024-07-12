import * as dbMethods from "../../../DB/dbMethods.js"
import CATEGORY from "../../../DB/models/category.model.js"
import TASK from "../../../DB/models/task.model.js"

/**
 * 1-   Get task data from body and id of the user
 * 2-   Create Task Object
 * 3-   Check if Category is existed for this user
 * 4-   Create task
 * 5-   Check Edge Case
 * 6-   Respond with the new task
 */
export const createTask = async (req, res, next) => {
  //  1-   Get task data from body and id of the user
  const { categoryID, state, body } = req.body
  const { _id } = req.authUser
  //  2-   Create Task Object
  const task = {}
  task.creator = _id
  //  3-   Check if Category is existed for this user
  if (categoryID) {
    const isCategoryExisted = await dbMethods.findOneDocument(CATEGORY, {
      _id: categoryID,
      creator: _id,
    })

    if (!isCategoryExisted.success)
      return next(
        new Error("This Category is not existed for this user", { cause: 404 })
      )

    task.categoryID = categoryID
  }
  state && (task.state = state)
  body && (task.body = body)

  // 4-   Create task
  const newTask = await dbMethods.createDocument(TASK, task)

  // 5-   Check Edge Case
  if (!newTask.success)
    return next(new Error(newTask.message, { cause: newTask.status }))

  // 6-   Respond with the new task
  res
    .status(newTask.status)
    .json({ message: newTask.message, task: newTask.result })
}

/**
 * 1-   Get all shared tasks
 * 2-   Respond with the result
 */
export const getAllTasks = async (req, res, next) => {
  const tasks = await dbMethods.findDocuments(TASK, { state: "shared" })

  res.status(tasks.status).json({ message: tasks.message, tasks: tasks.result })
}

/**
 * 1-   Get task id from params
 * 2-   Get Task by this id and state : "shared"
 * 3-   Respond with the result
 */
export const getSharedTaskById = async (req, res, next) => {
  // 1-   Get task id from params
  const { taskId } = req.params
  // 2-   Get Task by this id and state : "shared"
  const task = await dbMethods.findOneDocument(TASK, {
    _id: taskId,
    state: "shared",
  })
  if (!task.success)
    return next(new Error(task.message, { cause: task.status }))
  // 3-   Respond with the result
  res.status(task.status).json({ message: task.message, task: task.result })
}

/**
 * 1-   Get user id from req object
 * 2-   Get Tasks by this id
 * 3-   Respond with the result
 */
export const getMyTasks = async (req, res, next) => {
  const { _id } = req.authUser

  const tasks = await dbMethods.findDocuments(TASK, { creator: _id })

  res.status(tasks.status).json({ message: tasks.message, tasks: tasks.result })
}

/**
 * 1-   Get task id from params
 * 2-   Get Task by this id and state : "shared"
 * 3-   Respond with the result
 */
export const getTaskById = async (req, res, next) => {
  // 1-   Get task id from params
  const { taskId } = req.params
  // 2-   Get Task by this id and state : "shared"
  const task = await dbMethods.findOneDocument(TASK, {
    _id: taskId,
  })
  if (!task.success)
    return next(new Error(task.message, { cause: task.status }))
  // 3-   Respond with the result
  res.status(task.status).json({ message: task.message, task: task.result })
}

/**
 * 1-   Get task data from body, taskId from params and id of the user
 * 2-   Check if Task is existed
 * 3-   Check if Category is existed for this user
 * 4-   Update the task
 * 5-   Respond with the new task
 */
export const updateTask = async (req, res, next) => {
  //  1-   Get task data from body, taskId from params and id of the user
  const { categoryID, state, body } = req.body
  const { taskId } = req.params
  const { _id } = req.authUser

  //  2-   Check if Task is existed
  const task = await dbMethods.findOneDocument(TASK, {
    _id: taskId,
    creator: _id,
  })
  if (!task.success)
    return next(
      new Error("There's no task with this id for this user", { cause: 404 })
    )

  //  3-   Check if Category is existed for this user
  if (categoryID) {
    const isCategoryExisted = await dbMethods.findOneDocument(CATEGORY, {
      _id: categoryID,
      creator: _id,
    })

    if (!isCategoryExisted.success)
      return next(
        new Error("This Category is not existed for this user", { cause: 404 })
      )

    task.result.categoryID = categoryID
  }
  state && (task.result.state = state)
  body && (task.result.body = body)

  // 4-   Update the task
  task.result.__v += 1
  await task.result.save()

  // 5-   Respond with the new task
  res.status(200).json({
    message: "Task has been updated successfully",
    task: task.result,
  })
}

/**
 * 1-   Get _id from req.authUser and task ID from params
 * 2-   Find task with taskId
 * 3-   Check if it's not existed
 * 4-   Check if the task creator is the authenticated user
 * 5-   Delete the task
 * 6-   Check if it's not deleted
 * 7-   Respond with the status and message
 */
export const deleteTask = async (req, res, next) => {
  // 1-   Get _id from req.authUser and task ID from params
  const { taskId } = req.params
  const { _id } = req.authUser

  // 2-   Find task with taskId
  const findTask = await dbMethods.findByIdDocument(TASK, taskId)

  // 3-   Check if it's not existed
  if (!findTask.success)
    return next(new Error(findTask.message, { cause: findTask.status }))

  // 4-   Check if the task creator is the authenticated user
  if (findTask.result.creator.toString() != _id.toString())
    return next(
      new Error("User Must delete only his own tasks", {
        cause: 403,
      })
    )

  // 5-   Delete the task
  const deleteTask = await dbMethods.findByIdAndDeleteDocument(TASK, taskId)

  // 6-   Check if it's not deleted
  if (!deleteTask.success)
    return next(new Error(deleteTask.message, { cause: deleteTask.status }))

  // 7-   Respond with the status and message
  res.status(200).json({ message: "Task has been deleted successfully" })
}

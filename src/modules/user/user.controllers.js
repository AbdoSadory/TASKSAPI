import * as dbMethods from "../../../DB/dbMethods.js"
import USER from "../../../DB/models/user.model.js"
import bcryptjs from "bcryptjs"
import generateUserToken from "../../utils/generateUserToken.js"

/**
 * 1- Check username if it is existed
 * 2- Check Email if it is existed
 * 3- Hashing Password
 * 4- Create New User
 */
export const signUp = async (req, res, next) => {
  const { username, email, password } = req.body

  // 1- Check username if it is existed
  const isUsernameExisted = await dbMethods.findOneDocument(USER, { username })
  if (isUsernameExisted.success) {
    return next(new Error("this Username is already existed", { cause: 409 }))
  }
  // 2- Check Email if it is existed
  const isEmailExisted = await dbMethods.findOneDocument(USER, { email })
  if (isEmailExisted.success) {
    return next(
      new Error("this Email address is already existed", { cause: 409 })
    )
  }

  // 3- Hashing Password
  const hashedPassword = bcryptjs.hashSync(
    password.trim(),
    parseInt(process.env.SALT)
  )

  //  4- Create New User
  const newUser = await dbMethods.createDocument(USER, {
    username,
    email,
    password: hashedPassword,
  })

  if (!newUser.success) {
    return next(new Error(newUser.message, { cause: newUser.status }))
  }

  res.status(newUser.status).json({
    message: "User has been created successfully",
    user: newUser.result,
  })
}

/**
 * 1- Check username if it is existed
 * 2- Check password if it is matched
 * 3- Create Token
 * 4- Send User data and Token
 */
export const login = async (req, res, next) => {
  const { username, password } = req.body

  // 1- Check username if it is existed
  const isUserExisted = await dbMethods.findOneDocument(USER, { username })
  if (!isUserExisted.success) {
    return next(new Error("Invalid Credentials", { cause: 404 }))
  }

  //  2- Check password if it is matched
  const isPasswordMatched = bcryptjs.compareSync(
    password,
    isUserExisted.result.password
  )
  if (!isPasswordMatched) {
    return next(new Error("Invalid Credentials", { cause: 401 }))
  }
  // 3- Create Token
  const token = generateUserToken({
    id: isUserExisted.result._id.toString(),
    email: isUserExisted.result.email,
  })

  // 4- Send User data and Token
  res
    .status(isUserExisted.status)
    .json({ message: isUserExisted.message, user: isUserExisted.result, token })
}

/**
 * 1- Check if user is existed
 * 2- In Case of updating Username, Check if the new one is already existed
 * 3- In Case of updating Email, Check if the new one is already existed
 * 4- In Case of updating Password, check if incoming password doesn't match the Database hashed password
 * 5- Hash the new password and update it
 * 6- Update The account
 * 7- Generate Token
 * 8- Respond the updated account and new token
 */

export const updateUser = async (req, res, next) => {
  const { username, email, oldPassword, newPassword } = req.body
  const { _id } = req.authUser

  // 1- Check if user is existed
  const isUserExisted = await dbMethods.findByIdDocument(USER, _id)
  if (!isUserExisted.success) {
    return next(new Error("This Username is not existed", { cause: 409 }))
  }

  // 2- In Case of updating Username, Check if the new one is already existed
  if (username) {
    const isUsernameExisted = await dbMethods.findOneDocument(USER, {
      username,
    })
    if (
      isUsernameExisted.success &&
      isUsernameExisted.result._id.toString() !== _id.toString()
    ) {
      return next(
        new Error("This username is already existed for another user", {
          cause: 409,
        })
      )
    }

    isUserExisted.result.username = username
  }

  // 3- In Case of updating Email, Check if the new one is already existed
  if (email) {
    const isEmailExisted = await dbMethods.findOneDocument(USER, { email })
    if (
      isEmailExisted.success &&
      isEmailExisted.result._id.toString() !== _id.toString()
    ) {
      return next(
        new Error("This Email is already existed for another user", {
          cause: 409,
        })
      )
    }

    isUserExisted.result.email = email
  }

  if (oldPassword && newPassword) {
    // 4- In Case of updating Password, check if incoming password doesn't match the Database hashed password
    const isPasswordMatched = bcryptjs.compareSync(
      oldPassword,
      isUserExisted.result.password
    )
    if (!isPasswordMatched) {
      return next(
        new Error("Old Password isn't the same with current one", {
          cause: 409,
        })
      )
    }

    // 5- Hash the new password and update it
    const hashedPassword = bcryptjs.hashSync(
      newPassword.trim(),
      parseInt(process.env.SALT)
    )
    isUserExisted.result.password = hashedPassword
  }

  // 6- Update The account
  isUserExisted.result.__v += 1
  await isUserExisted.result.save()

  // 7- Generate Token
  const token = generateUserToken({
    id: isUserExisted.result._id.toString(),
    email: isUserExisted.result.email,
  })

  // 8- Respond the updated account and new token
  res.status(200).json({
    message: "User has been updated",
    user: isUserExisted.result,
    token,
  })
}

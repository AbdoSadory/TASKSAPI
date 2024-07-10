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

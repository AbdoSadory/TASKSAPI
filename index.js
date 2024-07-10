import express from "express"
import { config } from "dotenv"
import db_connection from "./DB/connection.js"
import userRouter from "./src/modules/user/user.routes.js"
import globalErrorHandler from "./src/middlewares/globalErrorHandler.js"

config()
db_connection()
const app = express()
app.use(express.json())

app.get("/", (req, res, next) => {
  res.status(200).json({ message: "Welcome To Tasks API for Route Job Fair" })
})

app.use("/user", userRouter)

app.use("*", (req, res, next) => {
  next(new Error("Invalid URL"))
})

app.use(globalErrorHandler)
app.listen(process.env.PORT, () => {
  console.log(`Server is running on port ${process.env.PORT} 🔥🔥🔥`)
})

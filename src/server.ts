import express from "express";
import connectDB from "./config/db";
import authRouter from "./route/authentication"

connectDB()

const app = express()
app.use(express.json())

// Middlewares for authentication and protected and admin:
app.use("/api/auth", authRouter)

const port = process.env.PORT || 5000

app.listen(port, () => {
  console.log(`Server listening on port ${port}`)
})
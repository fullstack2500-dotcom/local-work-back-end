import express from "express";
import connectDB from "./config/db";
import authRouter from "./route/authentication"
import protectedRoutes from "./route/protected"
import helmet from "helmet";
import cors from "cors"

connectDB()

const app = express()

// Security middlewares:
app.use(helmet())
app.use(cors())

app.use(express.json())

// Middlewares for authentication and protected and admin:
app.use("/api/auth", authRouter)
app.use("/api", protectedRoutes)

const port = process.env.PORT || 5000

app.listen(port, () => {
  console.log(`Server listening on port ${port}`)
})
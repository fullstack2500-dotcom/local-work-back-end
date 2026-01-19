import express from "express";
import connectDB from "./config/db";
import authRouter from "./route/authentication"
import protectedRoutes from "./route/protected"
import adminRoutes from "./route/admin"
import helmet from "helmet";
import cors from "cors"
import slowDown from "express-slow-down";
import rateLimit from "express-rate-limit";
import cookieParser from "cookie-parser"

connectDB()

const app = express()

// Allow Cookies:
app.use(cookieParser())

// Security middlewares:
app.use(helmet())
app.use(cors())

app.use(express.json())


// Rate Limit:
const rateLimiter = rateLimit({
  windowMs: 2 * 60 * 1000,
  max: 500,
  message: "Too many requests, please try again after 2 minutes"
})

// Slow Down:
const speedLimit = slowDown({
  windowMs: 15 * 60 * 1000,
  delayAfter: 40,
  delayMs: (hits) => hits * 120
})

// Allow app to use rate limiter and speed limiter:
app.use("/api", rateLimiter, speedLimit)

// Middlewares for authentication and protected and admin:
app.use("/api/auth", authRouter)
app.use("/api/pro", protectedRoutes)
app.use("/api/admin", adminRoutes)

const port = process.env.PORT || 5000

app.listen(port, () => {
  console.log(`Server listening on port ${port}`)
})
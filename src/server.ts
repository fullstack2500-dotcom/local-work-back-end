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

/*
Source - https://stackoverflow.com/a/73001269
Posted by Alfredo Bangun, modified by community. See post 'Timeline' for change history
Retrieved 2026-02-16, License - CC BY-SA 4.0
*/

app.use(helmet.crossOriginResourcePolicy({ policy: "cross-origin" }));

app.use(cors({
  origin: 'http://localhost:8080',
  credentials: true
}))

app.use(express.json())
app.use("/public", express.static('public'))


// Rate Limit:
const rateLimiter = rateLimit({
  windowMs: 2 * 60 * 1000,
  max: 500,
  message: "Too many requests, please try again after 2 minutes"
})

// Slow Down:
const speedLimit = slowDown({
  windowMs: 15 * 60 * 1000,
  delayAfter: 60,
  delayMs: (hits) => hits * 60
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
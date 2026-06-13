import express from "express";
import connectDB from "./config/db";
import authRouter from "./route/authentication"
import protectedRoutes from "./route/protected"
import adminRoutes from "./route/admin"
import helmet from "helmet";
import cors from "cors";
import rateLimit from "express-rate-limit";
import cookieParser from "cookie-parser"
import { Server } from "socket.io";
import { initSocket } from "./socket";
import http from "http"

connectDB()

const app = express()
const server = http.createServer(app);


const io = initSocket(server)

// io.on("connection", (socket) => {
//   console.log("Connected:", socket.id);

//   const workerId = socket.handshake.auth.workerId;

//   console.log("Auth workerId:", workerId);

//   if (workerId) {
//     socket.join(workerId);

//     console.log(
//       "Rooms after join:",
//       [...socket.rooms]
//     );
//   }
// });

io.on("connection", (socket) => {
  const workerId = socket.handshake.auth.workerId;
  const employerId = socket.handshake.auth.employerId;
  const adminId = socket.handshake.auth.adminId;

  console.log("CONNECTED:", socket.id);
  console.log("AUTH:", socket.handshake.auth);

  if (employerId) {
    console.log("[SOCKET] employer connecting:", employerId);
    socket.join(employerId);

    console.log(
      "[SOCKET] rooms after join:",
      Array.from(socket.rooms)
    );
  }

  if (workerId) {
    socket.join(workerId);
  }

  if (adminId) {
    socket.join("admins");
  }
});


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
app.use("/uploads", express.static("uploads"));
app.use("/uploads/profile", express.static("uploads/profile"));


// Rate Limit:
const rateLimiter = rateLimit({
  windowMs: 2 * 60 * 1000,
  max: 500,
  message: "Too many requests, please try again after 2 minutes"
})

// Allow app to use rate limiter and speed limiter:
app.use("/api", rateLimiter)

// Middlewares for authentication and protected and admin:
app.use("/api/auth", authRouter)
app.use("/api/pro", protectedRoutes)
app.use("/api/admin", adminRoutes)

const port = process.env.PORT || 5000

server.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
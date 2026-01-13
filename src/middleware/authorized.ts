import jwt from "jsonwebtoken"
import { Request, Response, NextFunction } from "express"


const authorized = (req: Request, res: Response, next: NextFunction) => {
  const header = req.headers.authorization

  // If header doesn't exists:
  if (!header || !header.startsWith("Bearer "))
    return res.status(401).json({ success: false, message: "No token, authorization denied" })

  // Make the token:
  const token = header.split(" ")[1]

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string)
    req.user = decoded
    next()
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Invalid token"
    })
  }
}

export default authorized
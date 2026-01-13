import { Request, Response, NextFunction } from "express"

const admin = (req: Request, res: Response, next: NextFunction) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({
      success: false,
      message: "Admins only!"
    })
  }
}

export default admin
import { Request, Response } from "express";
import User from "../model/User";
import { JobSchema } from "../validator/protected";
import xss from "xss";
import Job from "../model/Job";

// Dashboard:
export const Dashboard = async (req: Request, res: Response) => {
  return res.status(200).json({
    success: true,
    message: "Dashboard Info"
  })
}



// Is the User Logged?:
export const IsUserLogged = async (req: Request, res: Response) => {
  return res.status(200).json({
    success: true,
    message: "User Successfully Logged"
  })
}



// Create new Job:
export const createJob = async (req: Request, res: Response) => {
  req.body.postedBy = req.user.id

  const validatedJobData = JobSchema.safeParse(req.body)
  if (validatedJobData.error) {
    const error = validatedJobData.error.issues
        return res.status(400).json({ success: false, message: error[0].message })
  }

  let { title, description } = validatedJobData.data

  // Sanitize XSS:
  title = xss(title)
  description = xss(description)

  try {
    return res.status(200).json({
      success: true,
      job: validatedJobData.data
    })
  } catch (error: unknown) {
    console.error(error)

    if (error instanceof Error) return res.status(400).json({ success: false, message: error.message })
    return res.status(500).json({ success: false, message: "Internal Server Error" })
  }
}



// Log Out Controller:
export const LogOut = async (req: Request, res: Response) => {
  try {
    return res
              .clearCookie("token")
              .status(200).json({
                success: true,
                message: "Successfully Logged Out!"
              })
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal Server Error"
    })
  }
}
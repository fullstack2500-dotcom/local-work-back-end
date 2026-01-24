import { Request, Response } from "express";
import User from "../model/User";
import { JobSchema } from "../validator/protected";

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



// Add new Job:
export const CreateJob = async (req: Request, res: Response) => {
  const validatedData = JobSchema.safeParse(req.body)
  if (validatedData.error) {
    const errors = validatedData.error.issues
    return res.status(400).json({
      success: false,
          message: errors[0].message
    })
  }

  const {
    title,
    description,
    postedBy,
    requirements,
    location,
    salaryPerDay,
    hours,
    type,
    status
  } = validatedData.data
  
  try {

  } catch (error: unknown) {
    console.error(error) // Log the errors

    if (error instanceof Error) {
      return res.status(400).json({
        success: false,
        message: error.message
      })
    }

    return res.status(500).json({
      success: false,
      message: "Internal Server Error"
    })
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
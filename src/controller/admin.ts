import User from "../model/User";
import { Request, Response } from "express";
import { TotalWorkerSchema } from "../validator/admin";

export const TotalWorkers = async (req: Request, res: Response) => {
  // Validate user input:
  const validatedRole = TotalWorkerSchema.safeParse({ role: "worker" })

  // If there is an error:
  if (validatedRole.error) {
    const errors = JSON.parse(validatedRole.error.message)
    return res.status(400).json({

      success: false,
      message: errors[0].message
    })
  }

  const { role } = validatedRole.data

  try {
    // Display total workers:
    const workers = await User.find({ role }).sort({ createdAt: -1 })

    if (workers.length === 0) return res.status(200).json({ success: true, message: "No workers available" })

    return res.status(200).json({
      success: true,
      workers,
      noOfWorkers: workers.length
    })
    
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal Server Error"
    })
  }
}
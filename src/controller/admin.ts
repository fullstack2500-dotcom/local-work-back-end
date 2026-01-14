import User from "../model/User";
import { Request, Response } from "express";
import { TotalWorkerSchema } from "../validator/admin";

export const TotalWorkers = async (req: Request, res: Response) => {
  try {
    const validatedRole = TotalWorkerSchema.safeParse(req.query)
    if (validatedRole.error) {
      const errors = JSON.parse(validatedRole.error.message)
      return res.status(400).json({

        success: false,
        message: errors[0].message
      })
    }

    const { role } = validatedRole.data

    const noOfWorkers = await User.find({ role })

    return res.status(200).json({
      success: true,
      totalWorkers: noOfWorkers.length
    })
  } catch (error) {
    console.error(error)

    return res.status(500).json({
      success: false,
      message: "Internal Server Error"
    })
  }
}
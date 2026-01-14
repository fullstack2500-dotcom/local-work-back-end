import User from "../model/User";
import { Request, Response } from "express";

export const TotalWorkers = async (req: Request, res: Response) => {
  try {
    const noOfWorkers = await User.find({ })
  } catch (error) {
    console.error(error)

    return res.status(500).json({
      success: false,
      message: "Internal Server Error"
    })
  }
}
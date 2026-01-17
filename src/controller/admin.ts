import User from "../model/User";
import { Request, Response } from "express";
import {
  TotalWorkerSchema,
  VerifiedWorkersSchema,
  PendingVerificationWorkersSchema
} from "../validator/admin";


// Workers:
export const TotalWorkers = async (req: Request, res: Response) => {
  const validatedRole = TotalWorkerSchema.safeParse({ role: "worker" })

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




// Verified Workers:
export const VerifiedWorkers = async (req: Request, res: Response) => {
  const validatedRoleAndStatus = VerifiedWorkersSchema.safeParse({ role: "worker", status: "verified" })

  if (validatedRoleAndStatus.error) {
    const errors = JSON.parse(validatedRoleAndStatus.error.message)
    return res.status(400).json({
      success: false,
      message: errors[0].message
    })
  }

  const { role, status } = validatedRoleAndStatus.data

  try {
    const workers = await User.find({ role, status }).sort({ createdAt: -1 })
    if (workers.length === 0) return res.status(200).json({ success: true, message: "No verified workers yet" })

    return res.status(200).json({
      success: true,
      workers,
      noOfVerifiedWorkers: workers.length
    })
  } catch (error) {
    console.error(error)

    return res.status(500).json({
      success: false,
      message: "Internal Server Error"
    })
  }
}




// Pending Verification:
export const PendingVerification = async (req: Request, res: Response) => {
  try {

  } catch (error) {
    console.error(error)
    
    return res.status(500).json({
      success: false,
      message: "Internal Server Error"
    })
  }
}




// Reported Accounts:
export const ReportedAccounts = async (req: Request, res: Response) => {
  try {

  } catch (error) {
    console.error(error)
    
    return res.status(500).json({
      success: false,
      message: "Internal Server Error"
    })
  }
}
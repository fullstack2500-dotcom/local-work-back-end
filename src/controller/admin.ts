import Worker from "../model/Worker";
import { Request, Response } from "express";
import {
  AcceptedSchema,
  PendingSchema,
  DeclinedSchema,
  TotalWorkerSchema,
  VerifiedWorkersSchema,
  PendingVerificationWorkersSchema,
  DeclinedWorkersSchema,
  NewSkillSchema,
  AppStatusSchema,
  UpdateSchema
} from "../validator/admin";
import { instanceErrors, mainError } from "../errors/showErrors";
import Employer from "../model/Employer";
import Job from "../model/Job";
import { array, success } from "zod";
import Skill from "../model/Skill";
import Application from "../model/Application";


// Workers:
export const TotalWorkers = async (req: Request, res: Response) => {
  try {
    const workers = await Worker.find().sort({ createdAt: -1 })
    return res.status(200).json({ success: true, workers, noOfWorkers: workers.length })
    
  } catch (error) {
    mainError(
      error,
      res
    )
  }
}




// Verified Workers:
export const VerifiedWorkers = async (req: Request, res: Response) => {
  const validatedRoleAndStatus = VerifiedWorkersSchema.safeParse({ status: "verified" })
  if (validatedRoleAndStatus.error) { const errors = validatedRoleAndStatus.error.issues; return res.status(400).json({ success: false, message: errors[0].message }) }

  const { status } = validatedRoleAndStatus.data

  try {
    const workers = await Worker.find({ status }).sort({ createdAt: -1 })
    return res.status(200).json({ success: true, workers, noOfVerifiedWorkers: workers.length })

  } catch (error) {
    mainError(
      error,
      res
    )
  }
}




// Pending Workers:
export const PendingWorkers = async (req: Request, res: Response) => {
  const validatedRoleAndStatus = PendingVerificationWorkersSchema.safeParse({ status: "pending" })
  if (validatedRoleAndStatus.error) { const errors = validatedRoleAndStatus.error.issues; return res.status(400).json({ success: false, message: errors[0].message }) }

  const { status } = validatedRoleAndStatus.data

  try {
    const workers = await Worker.find({ status }).sort({ createdAt: -1 })
    return res.status(200).json({ success: true, workers, noOfPendingWorkers: workers.length })
    
  } catch (error) {
    mainError(
      error,
      res
    )
  }
}





// Declined Workers:
export const DeclinedWorkers = async (req: Request, res: Response) => {
  const validatedRoleAndStatus = DeclinedWorkersSchema.safeParse({ status: "declined" })
  if (validatedRoleAndStatus.error) { const errors = validatedRoleAndStatus.error.issues; return res.status(400).json({ success: false, message: errors[0].message }) }

  const { status } = validatedRoleAndStatus.data

  try {
    const workers = await Worker.find({ status }).sort({ createdAt: -1 })
    return res.status(200).json({ success: true, workers, declined: workers.length })
    
  } catch (error) {
    mainError(
      error,
      res
    )
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







// Total Jobs Post:
export const TotalJobs = async (req: Request, res: Response) => {
  try {
    const jobs = await Job.find().sort({ createdAt: -1 })

    return res.status(200).json({
      success: true,
      jobs: jobs.length
    })
  } catch (error) {
    mainError(error, res)
  }
}



// Pending Jobs:
export const PendingJobs = async (req: Request, res: Response) => {
  const validatedData = PendingSchema.safeParse({ status: "pending" })
  if (validatedData.error) { const errors = validatedData.error.issues; return res.status(400).json({ success: false, message: errors[0].message }) }

  const { status } = validatedData.data

  try {
    const pendingJobs = await Job.find({ status }).sort({ createdAt: -1 })

    return res.status(200).json({
      success: true,
      pending: pendingJobs.length
    })
  } catch (error) {
    mainError(error, res)
  }
}




// Accepted Jobs:
export const Accepted = async (req: Request, res: Response) => {
  const validatedData = AcceptedSchema.safeParse({ status: "accepted" })
  if (validatedData.error) { const errors = validatedData.error.issues; return res.status(400).json({ success: false, message: errors[0].message }) }

  const { status } = validatedData.data

  try {
    const accepted = await Job.find({ status }).sort({ createdAt: -1 })

    return res.status(200).json({
      success: true,
      accepted: accepted.length
    })
  } catch (error) {
    mainError(error, res)
  }
}





// Declined Jobs:
export const Declined = async (req: Request, res: Response) => {
  const validatedData = DeclinedSchema.safeParse({ status: "declined" })
  if (validatedData.error) { const errors = validatedData.error.issues; return res.status(400).json({ success: false, message: errors[0].message }) }

  const { status } = validatedData.data

  try {
    const declined = await Job.find({ status }).sort({ createdAt: -1 })

    return res.status(200).json({
      success: true,
      declined: declined.length
    })
  } catch (error) {
    mainError(error, res)
  }
}



// Add New Skill:
export const NewSkillController = async (req: Request, res: Response) => {
  const validatedData = NewSkillSchema.safeParse(req.body)
  if (!validatedData.success) { const errors = validatedData.error.issues; return res.status(400).json({ success: false, message: errors[0].message }) }
  
  const { title } = validatedData.data

  try {
    const addSkill = new Skill({ title })
    await addSkill.save()

    return res.status(200).json({
      success: true,
      message: "Added new Skill"
    })
  } catch (error: unknown) {
    instanceErrors(
      error,
      res
    )
  }
}




// Displaying Applications:
export const Applications = async (req: Request, res: Response) => {
  const validatedStatus = AppStatusSchema.safeParse({ status_PR: "Pending Review", status_IS: "Interview Scheduled", status_AC: "Accepted", status_NS: "Not Selected" })
  if (validatedStatus.error) { const errors = validatedStatus.error.issues; return res.status(400).json({ success: false, message: errors[0].message }) }

  const { status_PR, status_IS, status_AC, status_NS } = validatedStatus.data

  try {
    const PR = await Application.find({ status: status_PR })
    const IS = await Application.find({ status: status_IS })
    const AC = await Application.find({ status: status_AC })
    const NS = await Application.find({ status: status_NS })

    return res.status(200).json({
      success: true,
      PR: PR.length,
      IS: IS.length,
      AC: AC.length,
      NS: NS.length
    })
  } catch (error) {
    instanceErrors(
      error,
      res
    )
  }
}







// Display Exported Jobs:
export const ViewJobs = async (req: Request, res: Response) => {
  try {
    const jobs = await Job.find().sort({ createdAt: -1 })
    if (jobs.length === 0) return res.status(200).json({ success: true, message: "No jobs available" })

    return res.status(200).json({
      success: true,
      jobs
    })
  } catch (error) {
    mainError(
      error,
      res
    )
  }
}





// Update Status:
export const UpdateJobStatus = async (req: Request, res: Response) => {
  const { job } = req.params
  const { newStatus } = req.body

  const validatedStatus = UpdateSchema.safeParse({ id: job, status: newStatus })

  if (validatedStatus.error) { const errors = validatedStatus.error.issues; return res.status(400).json({ success: false, message: errors[0].message }) }

  const { id, status } = validatedStatus.data

  try {
    const NewStatus = await Job.findOne({ _id: id })
    if (!NewStatus) return res.status(400).json({ success: false, message: "Job not found" })

    NewStatus.status = status || NewStatus.status
    await NewStatus.save()

    return res.status(200).json({
      success: true,
      NewStatus
    })
  } catch (error) {
    mainError(
      error,
      res
    )
  }
}







// Display Workers & Employers:
export const WorkersEmployers = async (req: Request, res: Response) => {
  try {
    const workers = await Worker.find().sort({ name: 1, createdAt: -1 })
    const employers = await Employer.find().sort({ email: 1, createdAt: -1 })

    return res.status(200).json({
      success: true,
      workers,
      employers
    })
  } catch (error) {
    mainError(
      error,
      res
    )
  }
}
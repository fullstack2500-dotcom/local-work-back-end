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
import Skill from "../model/Skill";
import Application from "../model/Application";




// Dashboard:
export const Dashboard = async (req: Request, res: Response) => {
  const validatedPending = PendingSchema.safeParse({ status: "pending" })
  const validatedAccepted = AcceptedSchema.safeParse({ status: "accepted" })
  const validatedDeclined = DeclinedSchema.safeParse({ status: "declined" })

  const validatedVerifiedWorkers = VerifiedWorkersSchema.safeParse({ status: "verified "})
  const validatedPendingWorkers = PendingVerificationWorkersSchema.safeParse({ status: "pending" })
  const validatedDeclinedWorkers = DeclinedWorkersSchema.safeParse({ status: "declined" })

  const validatedApplicationStatus = AppStatusSchema.safeParse({
    status_PR: "Pending Review",
    status_IS: "Interview Scheduled",
    status_AC: "Accepted",
    status_NS: "Not Selected"
  })

  try {
    const totalJobs = await Job.find()
    const pendingJobs = await Job.find({ status: validatedPending.data?.status })
    const acceptedJobs = await Job.find({ status: validatedAccepted.data?.status })
    const declinedJobs = await Job.find({ status: validatedDeclined.data?.status })

    const totalWorkers = await Worker.find()
    const verifiedWorkers = await Worker.find({ status: validatedVerifiedWorkers.data?.status })
    const pendingWorkers = await Worker.find({ status: validatedPendingWorkers.data?.status })
    const declinedWorkers = await Worker.find({ status: validatedDeclinedWorkers.data?.status })

    const totalApplications = await Application.find()
    const pendingApplication = await Application.find({ status: validatedApplicationStatus.data?.status_PR })
    const interviewScheduledApplication = await Application.find({ status: validatedApplicationStatus.data?.status_IS })
    const acceptedApplication = await Application.find({ status: validatedApplicationStatus.data?.status_AC })
    const notSelectedApplication = await Application.find({ status: validatedApplicationStatus.data?.status_NS })

    return res.status(200).json({
      success: true,
      jobs: totalJobs.length,
      pending: pendingJobs.length,
      accepted: acceptedJobs.length,
      declined: declinedJobs.length,
      workers: totalWorkers.length,
      verified: verifiedWorkers.length,
      pendingWorkers: pendingWorkers.length,
      declinedWorkers: declinedWorkers.length,
      applications: totalApplications.length,
      pendingApplication: pendingApplication.length,
      interviewScheduledApplication: interviewScheduledApplication.length,
      acceptedApplication: acceptedApplication.length,
      notSelectedApplication: notSelectedApplication.length
    })
  } catch (error) {
    mainError(
      error,
      res
    )
  }
}


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
  if (validatedRoleAndStatus.error) { const errors = validatedRoleAndStatus.error._zod.def; return res.status(400).json({ success: false, message: errors[0].message }) }

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
  if (validatedRoleAndStatus.error) { const errors = validatedRoleAndStatus.error._zod.def; return res.status(400).json({ success: false, message: errors[0].message }) }

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
  if (validatedRoleAndStatus.error) { const errors = validatedRoleAndStatus.error._zod.def; return res.status(400).json({ success: false, message: errors[0].message }) }

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






// Add New Skill:
export const NewSkillController = async (req: Request, res: Response) => {
  const validatedData = NewSkillSchema.safeParse(req.body)
  if (!validatedData.success) { const errors = validatedData.error._zod.def; return res.status(400).json({ success: false, message: errors[0].message }) }
  
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
  if (validatedStatus.error) { const errors = validatedStatus.error._zod.def; return res.status(400).json({ success: false, message: errors[0].message }) }

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

  if (validatedStatus.error) { const errors = validatedStatus.error._zod.def; return res.status(400).json({ success: false, message: errors[0].message }) }

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
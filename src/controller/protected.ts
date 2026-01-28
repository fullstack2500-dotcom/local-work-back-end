import { Request, Response } from "express";
import User from "../model/User";
import { AppSchema, JobOverviewSchema, JobSchema } from "../validator/protected";
import Job from "../model/Job";
import { filterXSS } from "xss";
import Application from "../model/Application";
import { UserSchema } from "../validator/authentication";
import { Types } from "mongoose";

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



// Workers:
// Create new Application
export const createApplication = async (req: Request, res: Response) => {
  req.body.job = new Types.ObjectId(req.body.job)
  req.body.worker = new Types.ObjectId(req.user.id)
  req.body.role = req.user.role

  const validatedApp = AppSchema.safeParse(req.body)
  if (validatedApp.error) {
    const errors = validatedApp.error.issues
    return res.status(400).json({
      success: false,
          code: errors[0].code,
          message: errors[0].message
    })
  }

  // Get the inputs required:
  const { job, role, worker, subject, message, contact } = validatedApp.data

  // Sanitize XSS Subject:
  const sanitizedSubject = filterXSS(subject, { 
    whiteList: {},
        stripIgnoreTag: true,
            stripIgnoreTagBody: true
  })

  // Sanitize XSS Message:
  const sanitizedMessage = filterXSS(message, {
    whiteList: {},
        stripIgnoreTag: true,
            stripIgnoreTagBody: true
  })

  // Sanitize XSS Contact:
  const sanitizedContact = filterXSS(contact, { whiteList: {}, stripIgnoreTag: true, stripIgnoreTagBody: true })


  try {
    const jobExists = await Job.findOne({ _id: job })
    if (!jobExists) return res.status(400).json({ success: false, message: "Job doesn't exist" })

    const workerExists = await User.findOne({ _id: worker, role: role })
    if (!workerExists) return res.status(400).json({ success: false, message: "Worker doesn't exist"})

    const payload = { job, worker, subject: sanitizedSubject, message: sanitizedMessage, contact: sanitizedContact }
    const newApp = new Application(payload)

    const application = await newApp.save()
    
    return res.status(200).json({
      success: true,
      message: "Your application has been received! Please check your messages for updates.",
      application
    })

  } catch (error: unknown) {
    console.error(error)

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









// Create new Job:
export const createJob = async (req: Request, res: Response) => {
  req.body.postedBy = new Types.ObjectId(req.user.id)

  const validatedJobData = JobSchema.safeParse(req.body)
  if (validatedJobData.error) {
    const error = validatedJobData.error.issues
        return res.status(400).json({ success: false, message: error[0].message })
  }

  const payload = validatedJobData.data

  // Sanitize XSS: Link - https://medium.com/@ferrosful/nodejs-security-unleashed-exploring-xss-attack-8d3a61a01a09:
  payload.title = filterXSS(payload.title, { whiteList: {}, stripIgnoreTag: true, stripIgnoreTagBody: true })
  payload.description = filterXSS(payload.description, { whiteList: {}, stripIgnoreTag: true, stripIgnoreTagBody: true })

  // Will log `**Hello,world!**`
  // console.log(`text: ${html.replace(/\\s/g, '')}`);
  // Commented for the source

  try {
    const newJob = new Job(payload)
    await newJob.save()
    
    return res.status(201).json({
      success: true,
      message: "Job Successfully Created!"
    })
  } catch (error: unknown) {
    console.error(error)

    if (error instanceof Error) return res.status(400).json({ success: false, message: error.message })
    return res.status(500).json({ success: false, message: "Internal Server Error" })
  }
}




// View Job Applications:
export const viewJobApplications = async (req: Request, res: Response) => {
  const validatedUserId = UserSchema.safeParse({ user: new Types.ObjectId(req.user.id) })
  if (validatedUserId.error) {
    const errors = validatedUserId.error.issues
        return res.status(400).json({ success: false, message: errors[0].message })
  }

  const { user } = validatedUserId.data

  try {
    const applications = await Application.find({ worker: user }).sort({ createdAt: -1 })

    if (!applications) {
      return res.status(200).json({ success: true, message: "You currently don't have any applications" })
    }

    return res.status(200).json({
      success: true,
      applications
    })
  } catch (error) {
    console.error(error)

    return res.status(500).json({
      success: false,
      message: "Internal Server Error"
    })
  }
}





// Employers:
// View Posted Jobs:
export const viewPostedJobs = async (req: Request, res: Response) => {
  const validatedUserId = UserSchema.safeParse({ user: new Types.ObjectId(req.user.id) })
  if (validatedUserId.error) {
    const error = validatedUserId.error.issues
        return res.status(400).json({ success: false, message: error[0].message })
  }

  const { user } = validatedUserId.data

  try {
    const jobs = await Job.find({ postedBy: user }).sort({ createdAt: -1 })
    if (!jobs) return res.status(200).json({ success: true, message: "No jobs available" })

    return res.status(200).json({
      success: true,
      jobs
    })
  } catch (error) {
    console.error(error)

    return res.status(500).json({
      success: false,
      message: "Internal Server Error"
    })
  }
}






// Display Job Overview:
export const viewJobOverview = async (req: Request, res: Response) => {
  const validatedJob = JobOverviewSchema.safeParse({ job: new Types.ObjectId(req.params.job) })
  if (validatedJob.error) {
    const errors = validatedJob.error.issues
        return res.status(400).json({ success: false, message: errors[0].message })
  }

  const { job } = validatedJob.data

  try {
    const job_Overview = await Job.findOne({ _id: job })
    if (!job_Overview) return res.status(404).json({ success: false, message: "Job doesn't exist" })

    return res.status(200).json({
      success: true, 
      job_Overview
    })
  } catch (error) {
    console.error(error)

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
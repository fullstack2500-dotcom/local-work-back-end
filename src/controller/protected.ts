import { Request, Response } from "express";
import { ApplicationSchema, CompanySchema, JobOverviewSchema, JobSchema, LocationSchema, TagSchema, employerIdSchema, ViewProfile, WorkerIDJob, JobIDJob, ApplicationStatusUpdate, OnlyAccepted, UpdateApplication, InterviewDate, CompanySchemaID, IsAppliedS } from "../validator/protected";
import Job from "../model/Job";
import { filterXSS } from "xss";
import Application from "../model/Application";
import { UserSchema } from "../validator/authentication";
import { Types } from "mongoose";
import Location from "../model/Location";
import { instanceErrors, mainError } from "../errors/showErrors";
import Tag from "../model/Tag";
import Company from "../model/Company";
import { success } from "zod";
import Employer from "../model/Employer";
import Worker from "../model/Worker";

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



// Create New Application:
export const newApplication = async (req: Request, res: Response) => {
  req.body.worker = 
    req.user.id

  const validatedData = ApplicationSchema.safeParse(req.body)
  const validatedStatus = OnlyAccepted.safeParse({ status: "ACCEPTED" })

  if (validatedData.error) { const errors = validatedData.error.issues; return res.status(400).json({ success: false, message: errors[0].message }) }
  if (validatedStatus.error) { const errors = validatedStatus.error.issues; return res.status(400).json({ success: false, message: errors[0].message })}
  
  const { job, worker } = validatedData.data
  const { status } = validatedStatus.data

  try {
    const JobAccepted = await Job.findOne({ _id: job, status })
    if (!JobAccepted) return res.status(400).json({ success: false, message: "Job does not exist / is not yet accepted" })

    const Applied = await Application.findOne({ job, worker })
    if (Applied) return res.status(400).json({ success: false, message: "Application already exists" })

    const newApplication = new Application({ job, worker })
    await newApplication.save()

    return res.status(200).json({
      success: true,
      application: newApplication
    })
  } catch (error: unknown) {
    instanceErrors(
      error,
      res
    )
  }
}













// Create new Job:
export const createJob = async (req: Request, res: Response) => {
  req.body.posted = req.user.id

  const validatedUser = employerIdSchema.safeParse({ id: req.body.posted, role: req.user.role })
  if (validatedUser.error) {
    const error = validatedUser.error.issues
        return res.status(400).json({ success: false, message: error[0].message })
  }

  const { id, role } = validatedUser.data

  const details = await Employer.findOne({ _id: id, role })
  if (!details) return res.status(404).json({ success: false, message: "Employer not found" })
  console.log(details.email, details.phone)

  req.body.email = details.email
  req.body.phone = details.phone
  req.body.company = req.user.company

  const validatedJobData = JobSchema.safeParse(req.body)
  if (validatedJobData.error) {
    const error = validatedJobData.error.issues
        return res.status(400).json({ success: false, message: error[0].message })
  }

  const payload = validatedJobData.data

  // Sanitize XSS: Link - https://medium.com/@ferrosful/nodejs-security-unleashed-exploring-xss-attack-8d3a61a01a09:
  payload.title = filterXSS(payload.title, { whiteList: {}, stripIgnoreTag: true, stripIgnoreTagBody: true })
  payload.description = filterXSS(payload.description, { whiteList: {}, stripIgnoreTag: true, stripIgnoreTagBody: true })
  payload.schedule = filterXSS(payload.schedule, { whiteList: {}, stripIgnoreTag: true, stripIgnoreTagBody: true })
  payload.salary = filterXSS(payload.salary, { whiteList: {}, stripIgnoreTag: true, stripIgnoreTagBody: true })
  // Will log `**Hello,world!**`
  // console.log(`text: ${html.replace(/\\s/g, '')}`);
  // Commented for the source

  for (let i = 0; i < payload.tags.length; i++) {
    payload.tags[i] = filterXSS(payload.tags[i], { whiteList: {}, stripIgnoreTag: true, stripIgnoreTagBody: true })
  }

  for (let i = 0; i < payload.requirements.length; i++) {
    payload.requirements[i] = filterXSS(payload.requirements[i], { whiteList: {}, stripIgnoreTag: true, stripIgnoreTagBody: true })
  }

  for (let i = 0; i < payload.benefits.length; i++) {
    payload.benefits[i] = filterXSS(payload.benefits[i], { whiteList: {}, stripIgnoreTag: true, stripIgnoreTagBody: true })
  }

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




// View Jobs:
export const viewJobs = async (req: Request, res: Response) => {
  const validatedWorker = WorkerIDJob.safeParse({ worker: req.user.id })
  const validatedStatus = OnlyAccepted.safeParse({ status: "ACCEPTED" })

  if (!validatedWorker.success) { const errors = validatedWorker.error._zod.def; return res.status(400).json({ success: false, message: errors[0].message })}
  if (!validatedStatus.success) { const errors = validatedStatus.error._zod.def; return res.status(400).json({ success: false, message: errors[0].message })}

  const { worker } = validatedWorker.data
  const { status } = validatedStatus.data
  let jobArray = []

  try {
    const jobs = await Job.find({ status }).sort({ createdAt: -1 })
    if (jobs.length < 1) return res.status(200).json({ success: true, jobs, message: "No jobs available" })

    for (let jobIndex = 0; jobIndex < jobs.length; jobIndex++) {
      const validatedJob = JobIDJob.safeParse({ job: String(jobs[jobIndex]._id) })
      if (!validatedJob.success) { const errors = validatedJob.error._zod.def; return res.status(400).json({ success: false, message: errors[0].message })}

      const { job } = validatedJob.data

      const isApplied = await Application.findOne({ worker, job })
      if (!isApplied) {
        jobArray.push({
          info: jobs[jobIndex],
          IsApplied: false
        })
      } else {
        jobArray.push({
          info: jobs[jobIndex],
          IsApplied: true
        })
      }
    }

    return res.status(200).json({
      success: true,
      jobs: jobArray
    })
  } catch (error) {
    
    mainError(
      error, res
    )
  }
}





// Display Locations:
export const Locations = async (req: Request, res: Response) => {
  try {
    const Locations = await Location.find().sort({ createdAt: -1 })
    if (!Locations.length) return res.status(200).json({ success: true, Locations, message: "No locations"})

    return res.status(200).json({
      success: true,
      Locations
    })
  } catch (error) {
    mainError(
      error,
      res
    )
  }
}


// Is Applied Controller:
export const IsApplied = async (req: Request, res: Response) => {
  const validatedAppliedStatus = IsAppliedS.safeParse({ worker: req.user.id, job: req.params.job })
  if (!validatedAppliedStatus.success) { const errors = validatedAppliedStatus.error._zod.def; return res.status(400).json({ success: false, message: errors[0].message })}

  const { worker, job } = validatedAppliedStatus.data

  try {
    const application = await Application.findOne({ worker, job })
    if (!application) return res.status(400).json({ success: false, isApplied: false })

    return res.status(200).json({
      success: true,
      isApplied: true
    })
  } catch (error) {
    mainError(
      error,
      res
    )
  }
}



// Employers:
// View Posted Jobs:
export const viewPostedJobs = async (req: Request, res: Response) => {
  const validatedUserId = UserSchema.safeParse({ user: req.user.id })
  if (validatedUserId.error) {
    const error = validatedUserId.error.issues
        return res.status(400).json({ success: false, message: error[0].message })
  }

  const { user } = validatedUserId.data

  try {
    const jobs = await Job.find({ postedBy: user }).sort({ createdAt: -1 })
    if (jobs.length === 0) return res.status(200).json({ success: true, message: "No jobs available" })

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





// Add Company:
export const addCompany = async (req: Request, res: Response) => {
  const validatedData = CompanySchema.safeParse(req.body);
  if (validatedData.error) {
    const errors = validatedData.error.issues;
    return res.status(400).json({ success: false, message: errors[0].message })
  }

  const { title } = validatedData.data

  // Sanitize XSS Title:
  const sanitizedTitle = filterXSS(title, { 
    whiteList: {},
        stripIgnoreTag: true,
            stripIgnoreTagBody: true
  })

  try {
    const newCompany = new Company({ title: sanitizedTitle })
    await newCompany.save()

    return res.status(201).json({
      success: true,
      message: "Company successfully created!"
    })
  } catch (error) {

    instanceErrors(
      error,
      res
    )
  }
}





// Location:
export const AddLocation = async (req: Request, res: Response) => {
  const validatedData = LocationSchema.safeParse(req.body)
  if (validatedData.error) {
    const errors = validatedData.error.issues
    return res.status(400).json({ success: false, message: errors[0].message })
  }

  const { name } = validatedData.data

  // Sanitize XSS Title:
  const sanitizedName = filterXSS(name, { 
    whiteList: {},
        stripIgnoreTag: true,
            stripIgnoreTagBody: true
  })
  
  try {
    const newLocation = new Location({ name: sanitizedName })
    await newLocation.save()

    return res.status(201).json({ success: true, message: "Location Successfully Created!" })
  } catch (error) {

    instanceErrors(
      error,
      res
    )
  }
}






// Add Skill:
export const AddTag = async (req: Request, res: Response) => {
  const validatedData = TagSchema.safeParse(req.body)
  if (validatedData.error) {
    const errors = validatedData.error.issues
    return res.status(400).json({ success: false, message: errors[0].message })
  }

  const { title } = validatedData.data

  // Sanitize XSS Title:
  const sanitizedTitle = filterXSS(title, { 
    whiteList: {},
        stripIgnoreTag: true,
            stripIgnoreTagBody: true
  })

  try {
    
    const newTag = new Tag({ title: sanitizedTitle })
    await newTag.save()

    return res.status(201).json({
      success: true,
      message: "Tag successfully Added!"
    })

  } catch (error) {

    instanceErrors(
      error,
      res
    )
  }
}




// View Job Applications:
export const viewApplicationsEmployer = async (req: Request, res: Response) => {
  try {
    const Applications = await Application.find().populate("job").populate("worker").sort({ createdAt: -1 })
    if (!Applications.length) return res.status(200).json({ success: true, message: "No Applications", Applications })

    return res.status(200).json({
      success: true,
      Applications
    })
  } catch (error) {
    mainError(
      error,
      res
    )
  }
}





// View Job Applications:
export const viewApplications = async (req: Request, res: Response) => {
  const validatedWorker = WorkerIDJob.safeParse({ worker: req.user.id })

  if (!validatedWorker.success) { const errors = validatedWorker.error.issues; return res.status(400).json({ success: false, message: errors[0].message }) }

  const { worker } = validatedWorker.data

  try {
    const Applications = await Application.find({ worker }).populate("job").sort({ createdAt: -1 })
    if (!Applications.length) return res.status(200).json({ success: true, message: "No Applications", Applications })

    return res.status(200).json({
      success: true,
      Applications
    })
  } catch (error) {
    mainError(
      error,
      res
    )
  }
}





// Update Status of Application:
export const WithdrawApplication = async (req: Request, res: Response) => {
  const validatedData = ApplicationStatusUpdate.safeParse({ _id: req.body._id, status: "Withdrawed" })
  if (!validatedData.success) { const errors = validatedData.error.issues; return res.status(400).json({ success: false, message: errors[0].message })}

  const { status, _id } = validatedData.data

  try {
    const application = await Application.findOne({ _id })
    if (!application) return res.status(404).json({ success: false, message: "Application was not found" })

    application.status = status || application.status
    await application.save()

    return res.status(200).json({
      success: true,
      message: "Application is Withdrawed"
    })
  } catch (error) {
    mainError(
      error,
      res
    )
  }
}





// Accept Application:
export const UpdateApp = async (req: Request, res: Response) => {
  const validatedStatus = UpdateApplication.safeParse(req.body)
  if (!validatedStatus.success) { const errors = validatedStatus.error._zod.def; return res.status(400).json({ success: false, message: errors[0].message })}

  const { _id, status, timeline } = validatedStatus.data

  try {
    const application = await Application.findOne({ _id })
    if (!application) return res.status(404).json({ success: false, message: "Application not found" })

    application.status = status || application.status
    application.timeline = timeline || application.timeline
    await application.save()

    return res.status(200).json({
      success: true,
      message: "Application successfully updated!"
    })
  } catch (error) {
    mainError(
      error,
      res
    )
  } 
}




// Update Interview Date:
export const UpdateInterview = async (req: Request, res: Response) => {
  const validatedDate = InterviewDate.safeParse(req.body)
  if (!validatedDate.success) { const errors = validatedDate.error._zod.def; return res.status(400).json({ success: false, message: errors[0].message })}

  const { _id, interviewDate } = validatedDate.data
  const newDate = interviewDate.split("-")

  try {
    const monthArray = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]
    const year = newDate[0]
    const month = monthArray[Number(newDate[1]) - 1]
    const day = newDate[1 + 1]

    const Date = `${month} ${day}, ${year}`
    const find_application = await Application.findOne({ _id })

    if (!find_application) return res.status(404).json({ success: false, message: "Application not found" })
    find_application.interviewDate = Date || find_application.interviewDate

    await find_application.save()

    return res.status(200).json({
      success: true,
      message: "Interview Date Successfully Updated!"
    })
  } catch (error) {
    mainError(
      error,
      res
    )
  }
}




// View Company Details:
export const CompanyDetails = async (req: Request, res: Response) => {
  const validatedCompany = CompanySchemaID.safeParse({ _id: req.user.company })
  if (!validatedCompany.success) { const errors = validatedCompany.error._zod.def; return res.status(400).json({ success: false, message: errors[0].message })}

  const { _id } = validatedCompany.data
  let TotalApplications = []

  try {
    const company = await Company.findOne({ _id }).populate("industry").populate("location").populate("companyOwner")
    const jobs = await Job.find({ company: _id }).sort({ createdAt: -1 })

    for (let compIndex = 0; compIndex < jobs.length; compIndex++) {
      const app = await Application.findOne({ job: String(jobs[compIndex]._id) })
      if (app) TotalApplications.push(app)
    }

    if (!company) return res.status(404).json({ success: false, message: "Company Not Found" })

    return res.status(200).json({
      success: true,
      company,
      Jobs: jobs.length,
      TotalApplications: TotalApplications.length
    })
  } catch (error) {
    mainError(
      error,
      res
    )
  }
}


// View Workers:
export const ViewWorkers = async (req: Request, res: Response) => {
  try {
    const Workers = await Worker.find().sort({ createdAt: -1 })
    if (!Workers.length) return res.status(200).json({ success: true, Workers })

    return res.status(200).json({
      success: true,
      Workers
    })
  } catch (error) {
    mainError(
      error,
      res
    )
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
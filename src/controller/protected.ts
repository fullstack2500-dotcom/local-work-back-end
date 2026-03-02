import { Request, Response } from "express";
import { ApplicationSchema, CompanySchema, JobOverviewSchema, JobSchema, LocationSchema, TagSchema, employerIdSchema, ViewProfile } from "../validator/protected";
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
  if (validatedData.error) { const errors = validatedData.error.issues; return res.status(400).json({ success: false, message: errors[0].message }) }

  const { job, worker } = validatedData.data

  try {
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




// View Job Applications:
// export const viewJobApplications = async (req: Request, res: Response) => {
//   const validatedUserId = UserSchema.safeParse({ user: req.user.id })
//   if (validatedUserId.error) {
//     const errors = validatedUserId.error.issues
//         return res.status(400).json({ success: false, message: errors[0].message })
//   }

//   const { user } = validatedUserId.data

//   try {
//     const applications = await Application.find({ worker: user }).sort({ createdAt: -1 })

//     if (!applications) {
//       return res.status(200).json({ success: true, message: "You currently don't have any applications" })
//     }

//     return res.status(200).json({
//       success: true,
//       applications
//     })
//   } catch (error) {
//     console.error(error)

//     return res.status(500).json({
//       success: false,
//       message: "Internal Server Error"
//     })
//   }
// }




// View Jobs:
export const viewJobs = async (req: Request, res: Response) => {
  try {
    const jobs = await Job.find().populate('company').sort({ createdAt: -1 })
    if (jobs.length < 1) return res.status(200).json({ success: true, message: "No jobs available" })

    return res.status(200).json({
      success: true,
      jobs
    })
  } catch (error) {
    
    mainError(
      error, res
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





// export const viewProfile = async (req: Request, res: Response) => {
//   const validatedUser = ViewProfile.safeParse({ id: req.user.id, role: req.user.role })
//   if (validatedUser.error) {
//     return res.status(400).json({ success: false, message: "Failed to validated User ID"} );
//   }

//   const { id, role } = validatedUser.data
//   try {
//     const viewProfile = await User.findOne({ _id: id, role }).select("-password").exec()
//     if (!viewProfile) return res.status(404).json({ success: false, message: "User not found" });

//     return res.status(200).json({
//       success: true,
//       user: viewProfile
//     })
//   } catch (error) {

//     mainError(
//       error,
//       res
//     )
//   }
// }








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
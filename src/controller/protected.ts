import { Request, Response } from "express";
import { ApplicationSchema, CompanySchema, JobOverviewSchema, EmployerIdSchema, JobSchema, LocationSchema, TagSchema, employerIdSchema, ViewProfile, WorkerIDJob, JobIDJob, ApplicationStatusUpdate, OnlyAccepted, UpdateApplication, InterviewDate, CompanySchemaID, IsAppliedS, WorkerID, TimeLineStatus, UpdateWorkerSchema, UpdateEmployerSchema, EmployerProfileS, RatingSchema, PostContacts, EmployerSchemaid, SkillID, PostMessage, ViewMessageByContactID, NotificationIDSchema, reportValidator, reportWorkerValidator, UpdateReportSchema, DeleteReportSchema, NewWorkerAssignmentSchema, UploadWorkerJobSchema, UpdateWorkerJobSchema, SubmittedFilesSchema, DeleteWorkerJobSchema, SubmittedJobsSchema, SubmittedJobsIDSchema, CompletedAssignmentSchema, NewWorkerJobSchema, DeleteJobSchema } from "../validator/protected";
import Job from "../model/Job";
import { filterXSS } from "xss";
import Application from "../model/Application";
import { UserSchema } from "../validator/authentication";
import { Types } from "mongoose";
import { instanceErrors, mainError } from "../errors/showErrors";
import Tag from "../model/Tag";
import { success } from "zod";
import Worker from "../model/Worker";
import Location from "../model/Location";
import Skill from "../model/Skill";
import Employer from "../model/Employer";
import Industry from "../model/Industry";
import Rating from "../model/Rating";
import Contact from "../model/Contact";
import axios from "axios";
import Company from "../model/Company";
import AdminNotification from "../model/AdminNotification";
import UserNotification from "../model/UserNotification";
import { createJobPayload, NewApplicationPayload, NewReportPayload } from "../notif-payload/admin";
import { NewMessagePayload, PostContactPayload, UpdateApplicationPayload, NewApplicationPayloadEmployer, NewReportPayloadEmployer, UpdateReportPayload } from "../notif-payload/user";
import { getIO } from "../socket";
import Message from "../model/Message";
import stringComparison from "string-comparison";
import ApplicationAccepted from "../model/ApplicationAccepted";
import { ResponseModel } from "../model/Response";
import Report from "../model/Report";
import VerifiedWorker from "../model/VerifiedWorker";
import ReportWorker from "../model/ReportWorker";
import WorkerAssignment from "../model/WorkerAssignment";
import fs from "fs";
import path from "path";
import JobsCompleted from "../model/JobsCompleted";
import { uploadJobs } from "../file/upload";


// =========================================================================
// = Protected Controllers:                                                =
// = - These are controllers accessed by users that are logged.            =
// =   specifically: (Workers && Employers)                                =
// =                                                                       =
// = List of Controllers:                                                  =
// = [Name] - [Purpose]                                                    =
// =                                                                       =
// = Dashboard - Controller used for testing if middleware worked. [Test]  =
// = IsUserLogged - Controller used for determining if the user is logged  =
// =                                                                       =
// =========================================================================


const replaceFile = (
  oldFile: string | undefined,
  newFile: Express.Multer.File | undefined,
  folder: string
) => {
  if (!newFile) return oldFile;

  if (oldFile) {
    const oldPath = path.join(folder, oldFile);

    if (fs.existsSync(oldPath)) {
      fs.unlinkSync(oldPath);
    }
  }

  return newFile.filename;
};


const jaro = stringComparison.jaroWinkler;

const normalize = (s: string) =>
  s.toLowerCase().replace(/[^\w\s]/g, "").trim();

const THRESHOLD = 0.95;

// [Global] - Controller used for testing if middleware worked:
export const Dashboard = async (req: Request, res: Response) => {
  return res.status(200).json({
    success: true,
    message: "Dashboard Info"
  })
}

// [Global] - Controller used for determining if the user is logged:
export const IsUserLogged = async (req: Request, res: Response) => {
  return res.status(200).json({
    success: true,
    message: "User Successfully Logged"
  })
}

// [Worker & Employer] - Show User Notifications.
export const UserNotifications = async (
  req: Request,
  res: Response
) => {
  try {
    const notifications = await UserNotification.find({
      targetUsers: req.user.id,
    }).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      notifications,
    });
  } catch (error) {
    instanceErrors(error, res);
  }
};


// Mark as Read:
export const MarkAsRead = async (req: Request, res: Response) => {
  const validatedData = NotificationIDSchema.safeParse({ _id: req.params._id })

  if (!validatedData.success) {
    return res.status(400).json({
      success: false,
      message: validatedData.error.issues[0].message
    })
  }

  const { _id } = validatedData.data;

  try {
    const notification = await UserNotification.findOne({ _id })

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: "Notification not found"
      })
    }

    notification.read = true || notification?.read
    await notification.save()

    return res.status(200).json({
      success: true,
      message: "Marked as Read"
    })
  } catch (error) {
    mainError(error, res)
  }
}


// Report Worker:
export const ReportWorkerController = async (req: Request, res: Response) => {

  const io = getIO()

  const validatedData = reportWorkerValidator.safeParse({
    ...req.body, employerId: req.user.id
  })

  if (!validatedData.success) {
    return res.status(400).json({
      success: false,
      message: validatedData.error.issues[0].message
    })
  }

  // console.log(validatedData.data)

  const { reportType, workerId, employerId, description } = validatedData.data;

  try {
    const sanitizedReportType = filterXSS(reportType, {
      whiteList: {}, stripIgnoreTag: true, stripIgnoreTagBody: true
    })

    const sanitizedDescription = filterXSS(description, {
      whiteList: {}, stripIgnoreTag: true, stripIgnoreTagBody: true
    })

    const newReport = new ReportWorker({
      workerId,
      employerId,
      reportType: sanitizedReportType,
      description: sanitizedDescription
    })

    await newReport.save();

    const notification = await AdminNotification.create(
      NewReportPayload(reportType, new Date())
    );

    io.emit("notification:new", notification)

    return res.status(201).json({
      success: true,
      newReport
    })
  } catch (error) {
    instanceErrors(error, res)
  }
}










// [Worker & Employer] - WorkerAssignments - Get Worker Assignments:
export const WorkerAssignments = async (req: Request, res: Response) => {
  const submittedFilter = req.params;

  try {
    let workerAssignments: any = [];
    let workerAssignmentsByEmp = [];

    if (req.user.role === "worker") {
      const workerAssignment = await WorkerAssignment.find({ targetWorkers: req.user.id }).sort({ createdAt: -1 }).populate("employerId")

      for (let i = 0; i < workerAssignment.length; i++) {
        const jobsCompleted = await JobsCompleted.findOne({ workerId: req.user.id, workerAssignment: workerAssignment[i]._id, submitted: true, status: "COMPLETED" })

        // Source - https://stackoverflow.com/a/27538363
        // Posted by thefourtheye, modified by community. See post 'Timeline' for change history
        // Retrieved 2026-07-23, License - CC BY-SA 4.0

        // const arrObj = [{a: 1, b: 2}, {c: 3, d: 4}, {e: 5, f: 6}];

        // console.log(arrObj.reduce(function(result, current) {
        //   return Object.assign(result, current);
        // }, {}));s

        // // If you prefer arrow functions, you can make it a one-liner
        // console.log(arrObj.reduce(((r, c) => Object.assign(r, c)), {}));

        // // Thanks Spen from the comments. You can use the spread operator with assign
        // console.log(Object.assign({}, ...arrObj));

        const jobsSubmitted = await JobsCompleted.findOne({ workerId: req.user.id, workerAssignment: workerAssignment[i]._id, submitted: true })
        const jobsRejected = await JobsCompleted.findOne({ workerId: req.user.id, workerAssignment: workerAssignment[i]._id, submitted: false, status: "REJECTED" })

        if (jobsSubmitted) {
          if (jobsCompleted) {
            const objArray = { workerAssignment: workerAssignment[i], submitted: true, completed: true, rejected: false }
            workerAssignments.push(objArray)
          } else {

            const objArray = { workerAssignment: workerAssignment[i], submitted: true, completed: false, rejected: false }
            workerAssignments.push(objArray)
          }

        } else {
          if (jobsRejected) {
            const objArray = { workerAssignment: workerAssignment[i], submitted: false, completed: false, rejected: true }
            workerAssignments.push(objArray)
          } else {
            const objArray = { workerAssignment: workerAssignment[i], submitted: false, completed: false, rejected: false }
            workerAssignments.push(objArray)
          }
        }
      }
    } else {
      workerAssignments  = await WorkerAssignment.find({ employerId: req.user.id }).sort({ createdAt: -1 }).populate("targetWorkers", "_id name")
    }

    return res.status(200).json({
      success: true,
      workerAssignments
    })
  } catch (error) {
    mainError(
      error,
      res
    )
  }
}

// [Employer] - CompletedAssignments - Get Completed Assignments by workerId / employerId:
export const CompletedAssignments = async (req: Request, res: Response) => {
  const validatedData = CompletedAssignmentSchema.safeParse({ employerId: req.user.id })

  if (!validatedData.success) {
    return res.status(400).json({
      success: false,
      result: validatedData.error.message
    })
  }

  const employerId = validatedData.data.employerId

  try {
    const CompletedJobs = await JobsCompleted.find({ employerId, submitted: true, status: "COMPLETED" }).sort({ createdAt: -1 }).populate("targetWorkers", "_id name")

    return res.status(200).json({
      success: true,
      CompletedJobs
    })
  } catch (error) {
    mainError(error, res)
  }
}

// [Worker] - WorkerAssignmentsById - Get Worker Assignments by ID:
export const SubmittedFiles = async (req: Request, res: Response) => {
  const validatedData = SubmittedFilesSchema.safeParse({ ...req.params, workerId: req.user.id })

  if (!validatedData.success) {
    console.error(validatedData.error.issues[0].message)
    return res.status(400).json({
      success: false,
      message: validatedData.error.issues[0].message
    })
  }

  const { _id, workerId } = validatedData.data

  try {
    const files = await JobsCompleted.find({ workerAssignment: _id, workerId })

    return res.status(200).json({
      success: true,
      files
    })
  } catch (error) {
    mainError(error, res)
  }
}

// [Employer] - SubmittedJobs - Get the submitted jobs of the workers:
export const SubmittedJobs = async (req: Request, res: Response) => {
  const validatedData = SubmittedJobsSchema.safeParse({ employerId: req.user.id })

  if (!validatedData.success) {
    return res.status(400).json({
      success: false
    })
  }

  const { employerId } = validatedData.data;
  let SubmittedJobs = []

  try {
    // Source - https://stackoverflow.com/a/12822773
    // Posted by JohnnyHK
    // Retrieved 2026-08-12, License - CC BY-SA 3.0
    const jobsSubmitted = await JobsCompleted.find({ employerId, submitted: true })
      .populate('workerId')
      .populate('employerId')
      .populate('workerAssignment')

    // A for loop:
    for (let index = 0; index < jobsSubmitted.length; index++) {
      if (!index) {
        SubmittedJobs.push(jobsSubmitted[index])
      } 
      
      else {
        // Here are the variables for ensuring that we compare ids:
        const current = `${jobsSubmitted[index].workerId}_${jobsSubmitted[index].workerAssignment}`
        const previous = `${jobsSubmitted[index - 1].workerId}_${jobsSubmitted[index - 1].workerAssignment}`

        // If the current is not equal to the previous:
        if (current !== previous) {

          // Push this to the array:
          SubmittedJobs.push(jobsSubmitted[index])
        }
      }
    }

    return res.status(200).json({
      success: true,
      SubmittedJobs
    })
  } catch (error) {
    mainError(error, res)
  }
}

// [Employer] - SubmittedJobsById - Get the submitted jobs by workerId and employerId:
export const SubmittedJobsById = async (req: Request, res: Response) => {
  const validatedData = SubmittedJobsIDSchema.safeParse({ ...req.params, employerId: req.user.id })

  if (!validatedData.data) {
    return res.status(400).json({
      success: false,
      info: validatedData.error.issues[0].message
    })
  }

  const { workerId, workerAssignment, employerId } = validatedData.data;

  try {
    const SubmittedJobs = await JobsCompleted.find({ workerId, employerId, workerAssignment })
      .populate("workerId")
      .populate("employerId")
      .populate("workerAssignment")

    const WorkerAssignmentInfo = await WorkerAssignment.findOne({ _id: workerAssignment })

    if (!WorkerAssignmentInfo) {
      return res.status(404).json({
        success: false,
        info: "Worker Assignment not found"
      })
    }

    const WorkerInfo = await Worker.findOne({ _id: workerId })

    if (!WorkerInfo) {
      return res.status(404).json({
        success: false,
        info: "Worker not found"
      })
    }

    return res.status(200).json({
      success: true,
      SubmittedJobs,
      WorkerAssignmentInfo,
      WorkerInfo
    })
  } catch (error) {
    mainError(error, res)
  }
}

// <h1>Worker Name has submitted ...</h1>
// Description
// [View Details]

// []

// [Worker] - NewWorkerJob - Create New Worker Job:
export const NewWorkerJob = async (req: Request, res: Response) => {
  const validatedData = NewWorkerJobSchema.safeParse(req.body);

  if (!validatedData.success) {
    return res.status(400).json({
      success: false,
      message: validatedData.error.issues[0].message
    })
  }

  const { jobCompleted, name } = validatedData.data;

  try {
    const JobCompleted = await JobsCompleted.findOne({ _id: jobCompleted })

    if (!JobCompleted) {
      return res.status(404).json({
        success: false,
        message: "Job Completed not found!"
      })
    }

    // // Source - https://stackoverflow.com/a/33049923
    // Posted by Adrian Schneider, modified by community. See post 'Timeline' for change history
    // Retrieved 2026-08-10, License - CC BY-SA 4.0
    JobCompleted.workerUpload.push({ name })
    JobCompleted.save()

    return res.status(201).json({
      success: true
    })
  } catch (error) {
    instanceErrors(error, res)
  }
}

// [Worker] - DeleteWorkerJob - Delete Worker Job:
export const DeleteWorkerJob = async (req: Request, res: Response) => {
  const validatedData = DeleteJobSchema.safeParse(req.params)

  if (!validatedData.success) {
    return res.status(400).json({
      success: false,
      info: validatedData.error.issues[0].message
    })
  }

  const { name, _id } = validatedData.data;

  try {

    // Main Source: https://www.geeksforgeeks.org/node-js/how-to-pull-item-from-an-array-in-mongoose/
    // Source used but wasn't truly executed: https://stackoverflow.com/questions/14763721/mongoose-delete-array-element-in-document-and-save
    const JobCompleted = await JobsCompleted.findOneAndUpdate(
      { _id },
      { $pull: { workerUpload: { name } }}
    )

    if (!JobCompleted) {
      console.error("Job not found")

      return res.status(404).json({
        success: false,
        info: "Job not found"
      })
    }

    console.log("Worker Uploads:", JobCompleted.workerUpload)

    const JobCompletedAvailable = JobCompleted.workerUpload.filter((wUpload) => 
      wUpload.name === name
    )

    console.log(JobCompletedAvailable.length)

    if (!JobCompletedAvailable.length) {
      return res.status(400).json({
        success: false,
        information: "Job doesn't exist"
      })
    }



    // Source used: https://medium.com/@priyaeswaran/automatic-image-deletion-in-node-js-multer-fs-f1835d272b92
    const imagePath = path.join(__dirname, "../../uploads/workerJobsCompleted", name);

    fs.unlink(imagePath, (err) => {
      if (err) {
        return res.status(400).json({ success: false, info: "Failed to delete image", err })
      }
        
      return res.status(200).json({
        success: true, info: "Successfully deleted image"
      })
    })
  } catch (error) {
    mainError(error, res)
  }
}

// [Employer] - NewWorkerAssignment - Employer creates new worker assignment:
export const NewWorkerAssignment = async (req: Request, res: Response) => {
  const validatedData = NewWorkerAssignmentSchema.safeParse({
    ...req.body, employerId: req.user.id
  });

  if (!validatedData.success) {
    const errors = validatedData.error.issues

    console.log(errors)

    return res.status(400).json({
      success: false,
      message: errors[0].message
    })
  }

  const { employerId, targetWorkers, title, description, submitBefore, rejectLate } = validatedData.data;

  try {
    if (!targetWorkers.length) {
      return res.status(400).json({
        success: false,
        message: "Please assign at least one worker"
      })
    }

    const sanitizedTitle = filterXSS(title, { whiteList: {}, stripIgnoreTag: true, stripIgnoreTagBody: true })
    const sanitizedDescription = filterXSS(description, { whiteList: {}, stripIgnoreTag: true, stripIgnoreTagBody: true })
    const sanitizedSubmitBefore = filterXSS(submitBefore, { whiteList: {}, stripIgnoreTag: true, stripIgnoreTagBody: true })

    const newWorkerAssignment = new WorkerAssignment({
      employerId,
      targetWorkers,
      title: sanitizedTitle,
      description: sanitizedDescription,
      submitBefore: sanitizedSubmitBefore,
      rejectLate
    })

    if (new Date(submitBefore) <= new Date()) {
      return res.status(400).json({
        success: false,
        info: "Invalid date."
      })
    }

    await newWorkerAssignment.save();

    return res.status(201).json({
      success: true,
      message: "Worker Assignment Successfully Added!"
    })

  } catch (error) {
    instanceErrors(
      error,
      res
    )
  }
}


// Mark All As Read:
export const MarkAllAsRead = async (req: Request, res: Response) => {
  const validatedWorkerEmployer = WorkerIDJob.safeParse({ worker: req.user.id })

  if (!validatedWorkerEmployer.success) {
    const errors = validatedWorkerEmployer.error.issues;

    return res.status(400).json({
      success: false,
      message: errors[0].message
    })
  }

  const { worker } = validatedWorkerEmployer.data;

  try {
    await UserNotification.updateMany({ targetUsers: worker, read: false }, {
      read: true
    })

    return res.status(200).json({
      success: true,
      message: "All Notifications Mark as Read!"
    })
  } catch (error) {
    mainError(error, res)
  }
}



// Mark as Read:
export const DeleteNotification = async (req: Request, res: Response) => {
  const validatedData = NotificationIDSchema.safeParse({ _id: req.params._id })

  if (!validatedData.success) {
    return res.status(400).json({
      success: false,
      message: validatedData.error.issues[0].message
    })
  }

  const { _id } = validatedData.data;

  try {
    const notification = await UserNotification.findOneAndDelete({ _id })

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: "Notification not found"
      })
    }

    return res.status(200).json({
      success: true,
      message: "Deleted"
    })
  } catch (error) {
    mainError(error, res)
  }
}


// Reports:
export const GetReports = async (
  req: Request,
  res: Response
) => {
  const reports = await Report.find({
    workerId: req.user.id,
  })
    .populate("employerId", "email")
    .sort({
      createdAt: -1,
    });

  res.json(reports);
};

// Reports:
export const GetReportsEmployer = async (
  req: Request,
  res: Response
) => {
  try {
    const reports = await Report.find({
      employerId: req.user.id,
    })
      .populate("workerId")
      .sort({
        createdAt: -1,
      });

    res.json(reports);
  } catch (error) {
    mainError(error, res)
  }
};



// Update Report Status:
export const UpdateReport = async (
  req: Request,
  res: Response
) => {
  
  const io = getIO()

  const validatedStatus = UpdateReportSchema.safeParse({
    user: req.user.id,
    report: req.body.report,
    status: req.body.status,
    recipientId: req.body.recipientId
  })

  if (!validatedStatus.success) {
    return res.status(400).json({
      success: false,
      message: validatedStatus.error.issues[0].message
    })
  }

  const { user, report, status, recipientId } = validatedStatus.data

  try {
    const ReportInfo = await Report.findOneAndUpdate({ _id: report }, { status })
    const employer = await Employer.findOne({ _id: user })

    if (!employer) return res.status(404).json({ success: false, message: "Employer not found" })

    if (!ReportInfo) {
      return res.status(404).json({
        success: false,
        message: "Report not found"
      })
    }

    const notification = await UserNotification.create(
      UpdateReportPayload(status, employer._id.toString(), new Date(), recipientId)
    )

    io.to(recipientId.toString()).emit(
      "notification:worker:new",
      notification
    )

    return res.status(200).json({
      success: true,
      report: ReportInfo
    })
  } catch (error) {
    mainError(error, res)
  }
}


// Create new report:
export const NewReport = async (req: Request, res: Response) => {

  const io = getIO();

  req.body.workerId = req.user.id

  try {
    const validatedReport = reportValidator.safeParse(req.body);

    if (!validatedReport.success) {
      return res.status(400).json({
        message: "Invalid report data",
        errors: validatedReport.error.flatten(),
      });
    }


    const { workerId, employerId, reportType, description } =
      validatedReport.data;

    const worker = await Worker.findOne({ _id: workerId })
    if (!worker) return res.status(404).json({ success: false, message: "Worker not found" })

    const sanitizedReportType = filterXSS(reportType, { whiteList: {}, stripIgnoreTag: true, stripIgnoreTagBody: true })
    const sanitizedDescription = filterXSS(description, { whiteList: {}, stripIgnoreTag: true, stripIgnoreTagBody: true })

    const newReport = await Report.create({
      workerId,
      employerId,
      reportType: sanitizedReportType,
      description: sanitizedDescription,
    });

    const notification = await UserNotification.create(
      NewReportPayloadEmployer(worker.name, employerId, new Date())
    )

    io.to(employerId.toString()).emit(
      "notification:employer:new",
      notification
    );


    return res.status(201).json({
      message: "Report submitted successfully",
      report: newReport,
    });

  } catch (error: any) {
    console.log(error);
    return res.status(500).json({
      message: error.message
    });
  }
};


// Delete Reports:
export const DeleteReport = async (req: Request, res: Response) => {
  const validatedData = DeleteReportSchema.safeParse({
    ...req.body,
    employerId: req.user.id
  })

  if (!validatedData.success) {
    console.error(validatedData.error.issues)

    return res.status(400).json({
      success: false,
      message: validatedData.error.issues[0].message
    })
  }

  const { _id, employerId, type } = validatedData.data
  let message = ""

  try {
    if (type === "deleteAll") {
      await Report.deleteMany({ employerId })
      message = "Successfully deleted reports"
    }

    if (type === "deleteById") {
      await Report.findOneAndDelete({
        _id,
        employerId,
      })
      message = "Successfully deleted report"
    }

    return res.status(200).json({
      success: true,
      message
    })
  } catch (error) {
    console.error(error)
    
    mainError(error, res)
  }
}

// Create New Application:
export const newApplication = async (req: Request, res: Response) => {
    
  const io = getIO();

  req.body.worker = req.user.id;

  const validatedData = ApplicationSchema.safeParse(req.body);

  if (!validatedData.success) {
    const errors = validatedData.error.issues;
    return res.status(400).json({
      success: false,
      message: errors[0].message,
    });
  }

  const { job, worker, location } = validatedData.data;

  try {
    const jobData = await Job.findById(job);

    if (!jobData) {
      return res.status(400).json({
        success: false,
        message: "Job does not exist",
      });
    }

    if (jobData.status !== "ACCEPTED") {
      return res.status(400).json({
        success: false,
        message: "Job is not available",
      });
    }

    if (jobData.positions < 1) {
      return res.status(400).json({
        success: false,
        message: "Job not available",
      });
    }

    const Applied = await Application.findOne({ job, worker });

    if (Applied) {
      return res.status(400).json({
        success: false,
        message: "Application already exists",
      });
    }

    const newApplication = new Application({ job, worker, location, company: jobData.company });
    await newApplication.save();

    // Create response
    const newResponse = await ResponseModel.create({
      job: jobData._id,
      application: newApplication._id,
      jobCreated: jobData.createdAt
    });

    const notification = await AdminNotification.create(
      NewApplicationPayload(jobData.title, new Date())
    );

    io.emit(
      "notification:new",
      notification
    );

    const workerInformation = await Worker.findOne({ _id: worker })

    if (!workerInformation) {
      return res.status(404).json({
        success: false,
        message: "Worker not found"
      })
    }

    const EmployerNotification = await UserNotification.create(
      NewApplicationPayloadEmployer(workerInformation.name, String(jobData.posted), new Date())
    )

    io.to(jobData.posted.toString()).emit(
      "notification:employer:new",
      EmployerNotification
    );

    return res.status(200).json({
      success: true,
      application: newApplication,
    });
  } catch (error: unknown) {
    instanceErrors(error, res);
  }
};



// Create new Job:
export const createJob = async (req: Request, res: Response) => {
    
  const io = getIO();

  req.body.posted 
    = req.user.id

  const validatedUser = employerIdSchema.safeParse({ id: req.body.posted, role: req.user.role })
  if (validatedUser.error) { const error = validatedUser.error.issues; return res.status(400).json({ success: false, message: error[0].message }) }

  const { id, role } = validatedUser.data

  const details = await Employer.findOne({ _id: id, role })
  if (!details) return res.status(404).json({ success: false, message: "Employer not found" })

  req.body.email = details.email
  req.body.phone = details.phone
  req.body.company = req.user.company

  const validatedJobData = JobSchema.safeParse(req.body)
  if (validatedJobData.error) { const error = validatedJobData.error.issues; return res.status(400).json({ success: false, message: error[0].message }) }

  const payload = validatedJobData.data

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const startDate = new Date(payload.startDate as string);
  startDate.setHours(0, 0, 0, 0);

  const applyBefore = new Date(payload.applyBefore as string);
  applyBefore.setHours(0, 0, 0, 0);

  if (startDate < today) {
    return res.status(400).json({
      success: false,
      message: "Start date cannot be in the past",
    });
  }

  if (applyBefore < today) {
    return res.status(400).json({
      success: false,
      message: "Apply before date cannot be in the past",
    });
  }

  // Sanitize XSS: Link - https://medium.com/@ferrosful/nodejs-security-unleashed-exploring-xss-attack-8d3a61a01a09:   // Will log `**Hello,world!**` - console.log(`text: ${html.replace(/\\s/g, '')}`); - Commented for the source
  payload.title = filterXSS(payload.title, { whiteList: {}, stripIgnoreTag: true, stripIgnoreTagBody: true })
  payload.description = filterXSS(payload.description, { whiteList: {}, stripIgnoreTag: true, stripIgnoreTagBody: true })
  payload.schedule = filterXSS(payload.schedule, { whiteList: {}, stripIgnoreTag: true, stripIgnoreTagBody: true })
  payload.salary = filterXSS(payload.salary, { whiteList: {}, stripIgnoreTag: true, stripIgnoreTagBody: true })
  payload.category = filterXSS(payload.category, { whiteList: {}, stripIgnoreTag: true, stripIgnoreTagBody: true })
  payload.categoryTitle = filterXSS(payload.categoryTitle ?? "", {
    whiteList: {},
    stripIgnoreTag: true,
    stripIgnoreTagBody: true,
  });

  const { category, categoryTitle } = payload;

  for (let i = 0; i < payload.tags.length; i++) { payload.tags[i] = filterXSS(payload.tags[i], { whiteList: {}, stripIgnoreTag: true, stripIgnoreTagBody: true }) }
  for (let i = 0; i < payload.requirements.length; i++) { payload.requirements[i] = filterXSS(payload.requirements[i], { whiteList: {}, stripIgnoreTag: true, stripIgnoreTagBody: true }) }
  for (let i = 0; i < payload.benefits.length; i++) {
    payload.benefits[i] = filterXSS(payload.benefits[i], { whiteList: {}, stripIgnoreTag: true, stripIgnoreTagBody: true })
  }

  try {
    let finalCategory = category;

    if (categoryTitle?.trim()) {
      const normalizedCategory = normalize(categoryTitle);

      const industries = await Industry.find({});

      let bestMatch = null;
      let bestScore = 0;

      for (const i of industries) {
        const score = jaro.similarity(
          normalizedCategory,
          normalize(i.title)
        );

        if (score > bestScore) {
          bestScore = score;
          bestMatch = i;
        }
      }

      const THRESHOLD = 0.95;

      if (bestMatch && bestScore >= THRESHOLD) {
        finalCategory = bestMatch.title;
      } else {
        const createdCategory = new Industry({
          title: categoryTitle,
        });

        await createdCategory.save();

        finalCategory = createdCategory.title;
      }
    }

    payload.category = finalCategory;
    
    if (!payload.tags.length) return res.status(400).json({ success: false, message: "Tags should not be empty" })
      
    const newJob = new Job(payload)
    await newJob.save()

    const notification = await AdminNotification.create(
      createJobPayload(
        payload.category,
        details.email,
        new Date()
      )
    );

    io.emit(
      "notification:new",
      notification
    );

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





// Get Industries:
export const GetIndustries = async (req: Request, res: Response) => {
  try {
    const industries = await Industry.find({ notAccepted: { $ne: true } }).sort({ createdAt: -1 });

    if (!industries.length) {
      return res.status(200).json({
        success: true,
        message: "No industries found",
        Industries: [],
      });
    }

    return res.status(200).json({
      success: true,
      Industries: industries,
    });
  } catch (error) {
    mainError(error, res)
  }
};


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
    const jobs = await Job.find({ status }).populate("posted").populate("location").sort({ createdAt: -1 })
    if (jobs.length < 1) return res.status(200).json({ success: true, jobs, message: "No jobs available" })

    for (let jobIndex = 0; jobIndex < jobs.length; jobIndex++) {
      const validatedJob = JobIDJob.safeParse({ job: String(jobs[jobIndex]._id) })
      if (!validatedJob.success) { const errors = validatedJob.error._zod.def; return res.status(400).json({ success: false, message: errors[0].message })}

      const { job } = validatedJob.data

      const isApplied = await Application.findOne({ worker, job })
      if (!isApplied) {
        jobArray.push({ info: jobs[jobIndex],
          IsApplied: false
        })
      } else {
        jobArray.push({ info: jobs[jobIndex],
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



// View Contacts:
export const ViewContacts = async (req: Request, res: Response) => {
  const validatedData = WorkerIDJob.safeParse({ worker: req.user.id })

  if (!validatedData.success) {
    const errors = validatedData.error.issues;
    return res.status(400).json({ success: false, message: errors[0].message })
  }

  const { worker } = validatedData.data;

  try {
    const contacts = await Contact.find({ worker })
      .sort({ createdAt: -1 })
      .populate({
        path: "employerId",
        populate: {
          path: "industry",
          select: "title",
        },
      });

    return res.status(200).json({
      success: true,
      contacts
    })
  } catch (error) {
    mainError(
      error,
      res
    )
  }
}




// View Contacts:
export const ViewContactsEmployer = async (req: Request, res: Response) => {
  const validatedData = employerIdSchema.safeParse({ id: req.user.id, role: req.user.role })

  if (!validatedData.success) {
    const errors = validatedData.error.issues;
    return res.status(400).json({ success: false, message: errors[0].message })
  }

  const { id } = validatedData.data;

  try {
    const contacts = await Contact.find({ employerId: id })
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      contacts
    })
  } catch (error) {
    mainError(
      error,
      res
    )
  }
}



// View Messages: // contact, worker, role, content
export const ViewMessage = async (req: Request, res: Response) => {
  const validatedData = ViewMessageByContactID.safeParse({ contact: req.params._id })

  if (!validatedData.success) {
    const errors = validatedData.error.issues;
    return res.status(400).json({
      success: false,
      message: errors[0].message
    })
  }

  const { contact } = validatedData.data;

  try {
    const ViewMessages = await Message.find({ contactId: contact }).sort({ createdAt: 1 })

    return res.status(200).json({
      success: true,
      ViewMessages
    })
  } catch (error) {
    mainError(error, res)
  }
}



// New Message:
export const NewMessage = async (req: Request, res: Response) => {
    
  const io = getIO();

  const validatedData = PostMessage.safeParse({
    contactId: req.params.contact,
    senderId: req.user.id,
    recipientId: req.body.recipient,
    senderRole: req.user.role,
    content: req.body.content
  });

  if (!validatedData.success) {
    const errors = validatedData.error.issues;

    return res.status(400).json({
      success: false,
      message: errors[0].message
    });
  }

  const { contactId, senderId, recipientId, senderRole, content } = validatedData.data;

  try {
    const sanitizedContent = filterXSS(content, { whiteList: {}, stripIgnoreTag: true, stripIgnoreTagBody: true });

    const newMessage = new Message({ contactId, senderId, recipientId, senderRole, content: sanitizedContent });
    await newMessage.save();

    let senderLabel = "";
    let role = "";
    
    
    await Contact.findByIdAndUpdate(
      contactId,
      {
        $set: {
          lastMessage: sanitizedContent,
          lastMessageAt: new Date(),
        },
        $inc:
          senderRole === "worker"
            ? { unreadCountEmployer: 1 }
            : { unreadCountWorker: 1 },
      }
    );

    if (senderRole === "worker") {
      const worker = await Worker.findById(senderId).select("name");
      senderLabel = worker?.name || "Unknown Worker";
      role = "employer"
    }

    if (senderRole === "employer") {
      const employer = await Employer.findById(senderId).select("email");
      senderLabel = employer?.email || "Unknown Employer";
      role = "worker"
    }
    
    const notification = await UserNotification.create(
      NewMessagePayload(
        senderLabel,
        recipientId,
        new Date()
      )
    );

    io.to(recipientId.toString()).emit(
      `notification:${role}:new`,
      notification
    );
    
    return res.status(201).json({
      success: true,
      message: "Successfully sent message"
    })
  } catch (error) {
    instanceErrors(
      error,
      res
    )
  }
}


// Mark Contant As Read:
export const MarkContactAsRead = async (
  req: Request,
  res: Response
) => {
  const { contactId } = req.params;
  const { role } = req.user;

  try {
    const update =
      role === "worker"
        ? { unreadCountWorker: 0 }
        : { unreadCountEmployer: 0 };

    const contact = await Contact.findByIdAndUpdate(
      contactId,
      { $set: update },
      { new: true }
    );

    if (!contact) {
      return res.status(404).json({
        success: false,
        message: "Contact not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Unread count reset successfully",
      contact,
    });
  } catch (error) {
    instanceErrors(error, res);
  }
};



// Post a Contact:
export const PostContact = async (req: Request, res: Response) => {
    
  const io = getIO();

  const validatedData = PostContacts.safeParse({
    ...req.body,
    employer: req.user.id
  })

  if (!validatedData.success) {
    return res.status(400).json({
      success: false,
      message: validatedData.error.issues[0].message
    })
  }

  const { employer, title, description, worker } = validatedData.data

  try {
    const Title = filterXSS(title, {
      whiteList: {},
      stripIgnoreTag: true,
      stripIgnoreTagBody: true
    })

    const Description = filterXSS(description, {
      whiteList: {},
      stripIgnoreTag: true,
      stripIgnoreTagBody: true
    })

    const newContact = new Contact({
      employerId: employer,
      worker,

      title: Title,
      description: Description,

      // keep existing fields updated
      lastMessage: Description,
      lastMessageAt: new Date(),
      unreadCountWorker: 1,
      unreadCountEmployer: 0,
      status: "active"
    })

    await newContact.save()

    const EmployerEmail = await Employer.findOne({ _id: employer })

    if (!EmployerEmail) {
      return res.status(400).json({
        success: false,
        Message: "Employer Not Found"
      })
    }

    const notificationPayload = PostContactPayload(
      EmployerEmail.email, // or whatever display name you use
      worker,
      new Date()
    )

    const notifications = new UserNotification(
      notificationPayload
    );

    await notifications.save();

    console.log(
      "Worker room:",
      worker.toString()
    );

    console.log(
      "Emitting to room:",
      worker.toString()
    );

    io.to(worker.toString()).emit(
      "notification:worker:new",
      notifications
    );

    return res.status(201).json({
      success: true,
      message: "Contact successfully added!"
    })

  } catch (error) {
    instanceErrors(error, res)
  }
}



// Open Positions:
export const OpenPositionsTotalApplications = async (req: Request, res: Response) => {
  const validatedData = EmployerProfileS.safeParse({ _id: req.user.id })
  const validatedComp = CompanySchemaID.safeParse({ _id: req.user.company }) // ??
  if (!validatedData.success) { const errors = validatedData.error._zod.def; return res.status(400).json({ success: false, message: errors[0].message })}

  const { _id } = validatedData.data
  try {
    const OpenPositions = await Job.find({ posted: _id }).sort({ createdAt: -1 })
    const jobs = await Job.find({ company: _id }).sort({ createdAt: -1})
    const TotalApplications = await Application.find({ _id }).sort({ createdAt: -1 })

    return res.status(200).json({
      success: true,
      OpenPositions,
      TotalApplications
    })
  } catch (error) {
    instanceErrors(
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


// View Profile:
export const ViewProfileController = async (req: Request, res: Response) => {
  const validatedWorker = WorkerID.safeParse({ _id: req.user.id })
  const validatedStatus = TimeLineStatus.safeParse({ status: "Interview Scheduled", timeline: "Interview" })

  if (!validatedWorker.success) { const errors = validatedWorker.error.issues; return res.status(400).json({ success: false, message: errors[0].message })}
  if (!validatedStatus.success) { const errors = validatedStatus.error.issues; return res.status(400).json({ success: false, message: errors[0].message })}

  const { _id } = validatedWorker.data
  const { status, timeline } = validatedStatus.data

  try {
    const WorkerProf = await Worker.findOne({ _id })
    const locations = await Location.find().sort({ createdAt: -1 })
    if (!WorkerProf) {
      return res.status(404).json({ success: false, message: "Worker doesn't exist"})
    }

    const validatedS = SkillID.safeParse({ skill: WorkerProf.skill })
    if (!validatedS.success) { const errors = validatedS.error.issues; return res.status(400).json({ success: false, message: errors[0].message })}

    const applications = await Application.find({ worker: _id }).sort({ createdAt: -1 })
    const skills = await Skill.find().sort({ createdAt: -1 })
    const interviews = await Application.find({ worker: _id, status: { $ne: status }, timeline: { $ne: timeline }, interviewDate: { $ne: "" } })


    return res.status(200).json({
      success: true,
      WorkerProf,
      Applications: applications.length,
      Interviews: interviews.length,
      Locations: locations,
      Skills: skills
    })
  } catch (error) {
    mainError(
      error,
      res
    )
  }
}




const BASE_URL = "https://api.placeslayer.com";

export const getCityProvinceList = async (req: Request, res: Response) => {
  const API_KEY = process.env.PLACESLAYER_KEY;
  try {
    if (!API_KEY) {
      return res.status(500).json({
        success: false,
        message: "Missing PLACESLAYER_KEY"
      });
    }

    const country = req.query.country || "PH";

    // 1. Get provinces
    const provincesRes = await axios.get(
      `${BASE_URL}/countries/${country}/provinces`,
      {
        headers: {
          "X-API-Key": API_KEY
        }
      }
    );


    const provincesRaw = provincesRes.data?.data ?? provincesRes.data;
    const provinces = Array.isArray(provincesRaw) ? provincesRaw : [];

    if (!provinces.length) {
      throw new Error("No provinces returned");
    }

    const results: any[] = [];

    for (const province of provinces) {
      try {
        const citiesRes = await axios.get(
          `${BASE_URL}/countries/${country}/provinces/${province.code}/cities`,
          {
            headers: { "X-API-Key": API_KEY }
          }
        );

        const citiesRaw = citiesRes.data?.data ?? citiesRes.data;
        const cities = Array.isArray(citiesRaw) ? citiesRaw : [];

        for (const city of cities) {
          results.push({
            city: city.name,
            province: province.name
          });
        }
      } catch (err) {
        console.error("Failed province:", province.code);
      }
    }

    return res.json({
      success: true,
      data: results
    });
  } catch (error: unknown) {
    const err = error as any;

    return res.status(500).json({
      success: false,
      message: err?.message || "Unknown error",
      details: err?.response?.data || null
    });
  }
};



// [Worker]: UpdateWorker: This updates the worker information of the workers
export const UpdateWorker = async (req: Request, res: Response) => {

  req.body = req.body || {};

  if (req.body.skills) {
    req.body.skills = JSON.parse(req.body.skills);
  }

  const validatedWorker = UpdateWorkerSchema.safeParse({ 
    ...req.body, 
    _id: req.user.id 
  })
  
  if (!validatedWorker.success) { const errors = validatedWorker.error._zod.def; return res.status(400).json({ success: false, message: errors[0].message })}

  const { _id, name, phoneNumber, location, jobTitle, yearsOfExperience, about_me, availability, expected_salary, skills } = validatedWorker.data
  const sanitizedBio = filterXSS(about_me, { whiteList: {}, stripIgnoreTag: true, stripIgnoreTagBody: true })

  try {
    const WorkerInfo = await Worker.findOne({ _id })
    if (!WorkerInfo) return res.status(404).json({ success: false, message: "Worker Not Found" })

    WorkerInfo.name = name || WorkerInfo.name

    WorkerInfo.phoneNumber = phoneNumber || WorkerInfo.phoneNumber
    WorkerInfo.location = location || WorkerInfo.location

    WorkerInfo.jobTitle = jobTitle || WorkerInfo.jobTitle
    WorkerInfo.yearsOfExperience = yearsOfExperience || WorkerInfo.yearsOfExperience

    WorkerInfo.about_me = sanitizedBio || WorkerInfo.about_me
    WorkerInfo.availability = availability || WorkerInfo.availability

    WorkerInfo.expected_salary 
    = expected_salary || WorkerInfo.expected_salary

    WorkerInfo.skills = skills || WorkerInfo.skills

    const files = req.files as {
      [fieldname: string]: Express.Multer.File[];
    };

    const resume = files?.resume?.[0];
    const photo = files?.photo?.[0];

    WorkerInfo.photo = `${replaceFile(
      WorkerInfo.photo,
      photo,
      path.join(__dirname, "../../uploads/profile")
    )}`

    WorkerInfo.resume = `${replaceFile(
      WorkerInfo.resume,
      resume,
      path.join(__dirname, "../../uploads/resumes")
    )}`

    await WorkerInfo.save()

    return res.status(200).json({
      success: true,
      message: "Worker Profile Success Update!"
    })

  } catch (error) {
    instanceErrors(
      error,
      res
    )
  }
}

// [Worker] - UploadWorkerJob: This uploads the worker's jobs completed, Source: https://medium.com/@mohsinansari.dev/handling-file-uploads-and-file-validations-in-node-js-with-multer-a3716ec528a3
export const UploadWorkerJob = async (req: Request, res: Response) => {
  const validatedData = UploadWorkerJobSchema.safeParse({
    ...req.body, workerId: req.user.id, ...req.params
  });

  console.log(validatedData)

  if (!validatedData.success) {
    const errors = validatedData.error.issues
    console.log(validatedData.error)

    return res.status(400).json({
      success: false,
      message: errors[0].message
    })
  }

  console.log(validatedData)

  const { workerId, workerAssignment, workerUpload, workerDescription, employerId, isLate } = validatedData.data;

  console.log(`
    Worker ID: ${workerId},
    Worker Assignment: ${workerAssignment},
    Worker Upload: ${workerUpload},
    Worker Description: ${workerDescription},
    Employer ID: ${employerId}
  `)

  try {
    const sanitizedWorkerDescription = filterXSS(workerDescription as string, {
      whiteList: {},
      stripIgnoreTag: true,
      stripIgnoreTagBody: true
    })

    const Submission = await WorkerAssignment.findOne({ _id: workerAssignment })

    if (!Submission) return res.status(404).json({ success: false })

    if (Submission.rejectLate) {
      if (new Date(Submission.submitBefore) <= new Date()) {
        console.log(new Date(), new Date(Submission.submitBefore))
        console.log("Late submitted not accepted")

        return res.status(400).json({
          success: false
        })
      }
    }

    console.log("Not Late:", new Date(Submission.submitBefore), "Current Date:", new Date())

    const newJobCompleted = new JobsCompleted({ workerId, workerAssignment, workerUpload, workerDescription: sanitizedWorkerDescription, employerId, isLate })
    await newJobCompleted.save()

    return res.status(201).json({
      success: true
    })
  } catch (error) {
    instanceErrors(error, res);
  }
}

// [Worker] - UploadWorkerJobFile: This uploads the worker's jobs completed file from multer
export const UploadWorkerJobFile = async (req: Request, res: Response) => {
  console.log("Executing UploadWorkerJobFile Controller")
  uploadJobs(req, res, (err) => {
    if (err) {
      console.log(err)
      return res.status(400).json({
        success: false,
        errors: err
      })
    }

    return res.status(201).json({
      success: true,
      filename: req.files
    })
  })
}

// [Worker & Employer] - UpdateWorkerJob: This updates the status of jobs completed either worker submits / employer marks their work as completed
export const UpdateWorkerJob = async (req: Request, res: Response) => {
  const validatedData = UpdateWorkerJobSchema.safeParse(
    req.user.role === "worker" ? { ...req.body, workerId: req.user.id }
                               : req.body
  )

  if (!validatedData.success) {
    return res.status(400).json({
      success: false,
      message: validatedData.error.issues[0].message
    })
  }

  const { workerAssignment, workerId, status } = validatedData.data
  let isLate = null

  try {
    const jobs = await JobsCompleted.find({ workerAssignment, workerId })

    if (!jobs.length) {
      return res.status(400).json({
        success: false,
        message: "You have not submitted any files yet."
      })
    }
    
    if (status === "submitted") {
      
      const Submission = await WorkerAssignment.findOne({ _id: workerAssignment })

      if (!Submission) return res.status(404).json({ success: false })

      if (Submission.rejectLate) {
        if (new Date(Submission.submitBefore) <= new Date()) {
          console.log(new Date(), new Date(Submission.submitBefore))
          console.log("Late submitted not accepted")

          return res.status(400).json({
            success: false
          })
        }
      }

      if (new Date(Submission.submitBefore) <= new Date()) {
        isLate = true
      } else {
        isLate = false
      }
      
      await JobsCompleted.updateMany({ workerAssignment, workerId }, { status: "PENDING", submitted: true, isLate })
    } else if (status === "completed") {
      await JobsCompleted.updateMany({ workerAssignment, workerId }, { status: "COMPLETED" })
    } else {
      await JobsCompleted.updateMany({ workerAssignment, workerId }, { status: "REJECTED", submitted: false })
    }

    return res.status(200).json({
      success: true,
      message: `Job Successfully Updated!`
    })
  } catch (error) {
    mainError(error, res)
  }
}

// [Worker] - DeleteWorkerJobFile: This deletes the file & the jobCompleted table, deleting files from the jobsCompleted
export const DeleteWorkerJobFile = async (req: Request, res: Response) => {
  const validatedData = DeleteWorkerJobSchema.safeParse(req.params)

  if (!validatedData.success) {
    return res.status(404).json({
      success: false,
      message: validatedData.error.issues[0].message
    })
  }

  const { _id } = validatedData.data

  try {
    const jobCompleted = await JobsCompleted.findOneAndDelete({ _id })

    if (!jobCompleted) {
      console.error("Failed to find job completed")

      return res.status(404).json({
        success: false,
        message: "Job not found"
      })
    }

    // Source used: https://medium.com/@priyaeswaran/automatic-image-deletion-in-node-js-multer-fs-f1835d272b92
    for (let i = 0; i < jobCompleted.workerUpload.length; i++) {
      const imagePath = path.join(__dirname, "../../uploads/workerJobsCompleted", jobCompleted.workerUpload[i].name);

      fs.unlink(imagePath, (err) => {
        if (err) return res.status(400).json({ success: false, info: "Failed to delete image" })
      })
    }

    return res.status(200).json({
      success: true, info: "Successfully deleted file"
    })
  } catch (error) {
    mainError(error, res)
  }
}

// [Worker] - UploadWorkerProfilePhoto: This updates the worker profile:
export const UploadWorkerProfilePhoto = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const worker = await Worker.findById(userId);

    if (!worker) {
      return res.status(404).json({
        success: false,
        message: "Worker not found",
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No file uploaded",
      });
    }

    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];

    if (!allowedTypes.includes(req.file.mimetype)) {
      return res.status(400).json({
        success: false,
        message: "Invalid file type",
      });
    }

    worker.photo = `/uploads/profile/${req.file.filename}`;

    await worker.save();

    return res.status(200).json({
      success: true,
      message: "Profile photo uploaded successfully",
      data: {
        photo: worker.photo,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Upload failed",
    });
  }
};

// [Employer] - UploadEmployerProfilePhoto: This updates the employer photo:
export const UploadEmployerProfilePhoto = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const employer = await Employer.findById(userId);

    if (!employer) {
      return res.status(404).json({
        success: false,
        message: "Employer not found",
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No file uploaded",
      });
    }

    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];

    if (!allowedTypes.includes(req.file.mimetype)) {
      return res.status(400).json({
        success: false,
        message: "Invalid file type",
      });
    }

    employer.profile = `/uploads/profile/${req.file.filename}`;

    await employer.save();

    return res.status(200).json({
      success: true,
      message: "Profile photo uploaded successfully",
      data: {
        profile: employer.profile,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Upload failed",
    });
  }
};

// [Employer] - UpdateEmployer: This updates the employer information
export const UpdateEmployer = async (req: Request, res: Response) => {

  const files = req.files as {
    [fieldname: string]: Express.Multer.File[];
  };

  const photo = files?.photo?.[0];
  const permit = files?.permit?.[0];

  const validatedEmployer = UpdateEmployerSchema.safeParse({
    ...req.body,
    _id: req.user.id
  });

  if (!validatedEmployer.success) {
    const errors = validatedEmployer.error._zod.def;
    return res.status(400).json({
      success: false,
      message: errors[0].message
    });
  }

  const {
    _id,
    company,
    phone,
    industry,
    industryTitle
  } = validatedEmployer.data;

  try {
    const EmployerInformation = await Employer.findById(_id);

    if (!EmployerInformation) {
      return res.status(404).json({
        success: false,
        message: "Employer Not Found"
      });
    }

    if (phone) EmployerInformation.phone = phone;
      
    EmployerInformation.profile = `${replaceFile(
      EmployerInformation.profile,
      photo,
      path.join(__dirname, "../../uploads/profile")
    )}`

    EmployerInformation.permit = `${replaceFile(
      EmployerInformation.permit,
      permit,
      path.join(__dirname, "../../uploads/permits")
    )}`

    const CompanyName = normalize(company);

    let finalIndustry =
      industry || EmployerInformation.industry.toString();

    if (industryTitle?.trim()) {
      const normalizedIndustryName = normalize(industryTitle);

      const industries = await Industry.find({});

      let bestMatch = null;
      let bestScore = 0;

      for (const i of industries) {
        const score = jaro.similarity(
          normalizedIndustryName,
          normalize(i.title)
        );

        if (score > bestScore) {
          bestScore = score;
          bestMatch = i;
        }
      }

      const THRESHOLD = 0.95;

      if (bestMatch && bestScore >= THRESHOLD) {
        finalIndustry = bestMatch._id.toString();
      } else {
        const createdIndustry = new Industry({
          title: industryTitle,
        });

        await createdIndustry.save();

        finalIndustry = createdIndustry._id.toString();
      }
    }

    EmployerInformation.industry = new Types.ObjectId(finalIndustry);

    const companies = await Company.find({});

    let bestMatch = null;
    let bestScore = 0;

    for (const c of companies) {
      const score = jaro.similarity(
        CompanyName,
        normalize(c.name)
      );

      if (score > bestScore) {
        bestScore = score;
        bestMatch = c;
      }
    }

    const THRESHOLD = 0.95;

    let finalCompanyName = CompanyName;

    if (bestMatch && bestScore >= THRESHOLD) {
      finalCompanyName = bestMatch.name;
    } else {
      const created = new Company({
        name: company,
        industry: finalIndustry
      });

      await created.save();

      finalCompanyName = created.name;
    }

    EmployerInformation.company = finalCompanyName;

    await Job.updateMany(
      { posted: _id },
      { $set: { company: finalCompanyName } }
    )

    const jobs = await Job.find({ posted: _id }).select('_id')

    await Application.updateMany(
      { job: { $in: jobs.map(j => j._id) } },
      { $set: { company: finalCompanyName } }
    )

    await EmployerInformation.save();

    return res.status(200).json({
      success: true,
      message: "Employer has successfully been updated!"
    });

  } catch (error) {
    mainError(error, res);
  }
};

// [Employer] - EmployerProfileController: This controller gives employer access to viewing employer profile:
export const EmployerProfileController = async (req: Request, res: Response) => {
  const validatedEmployer = EmployerProfileS.safeParse({ _id: req.user.id })
  if (!validatedEmployer.success) { const errors = validatedEmployer.error._zod.def; return res.status(400).json({ success: false, message: errors[0].message })}

  const { _id } = validatedEmployer.data

  try {
    const EmployerProf = await Employer.findOne({ _id })
    const Industries = await Industry.find({
      notAccepted: { $ne: true }
    }).sort({ createdAt: -1 });

    // console.log("FROM MONGOOSE");
    // console.dir(Industries, { depth: null });

    return res.status(200).json({
      success: true,
      EmployerProf,
      Industries,
    });
    if (!EmployerProf) return res.status(404).json({ success: false, message: "Employer Not Found" })

    return res.status(200).json({
      success: true,
      EmployerProf,
      Industries
    })
  } catch (error) {
    mainError(
      error,
      res
    )
  }
}

// [Worker] - ViewPostedJobs: This allows the worker to View Posted Jobs:
export const viewPostedJobs = async (req: Request, res: Response) => {
  const validatedUserId = UserSchema.safeParse({ user: req.user.id })
  if (validatedUserId.error) { const error = validatedUserId.error.issues; return res.status(400).json({ success: false, message: error[0].message }) }

  const { user } = validatedUserId.data

  try {
    const jobs = await Job.find({ postedBy: user }).sort({ createdAt: -1 })
    if (jobs.length === 0) return res.status(200).json({ success: true, message: "No jobs available" })

    return res.status(200).json({
      success: true,
      jobs
    })
  } catch (error) {
    instanceErrors(error, res)
  }
}



// Post a Review:
export const ReviewUpload = async (req: Request, res: Response) => {
  const validatedInfo = RatingSchema.safeParse({ ...req.body, worker: req.user.id })
  if (!validatedInfo.success) { const errors = validatedInfo.error._zod.def; return res.status(400).json({ success: false, message: errors[0].message })}

  const { worker, rating, description } = validatedInfo.data

  try {
    const Description = filterXSS(description, { whiteList: {}, stripIgnoreTag: true, stripIgnoreTagBody: true })
    const NewRate = new Rating({ worker, rating, description: Description })

    await NewRate.save()

    return res.status(201).json({
      success: true,
      message: "Review Successfully Uploaded!"
    })
  } catch (error) {
    instanceErrors(
      error,
      res
    )
  }
}



// Display Job Overview:
export const viewJobOverview = async (req: Request, res: Response) => {
  const validatedJob = JobOverviewSchema.safeParse({ job: new Types.ObjectId(req.params.job) })
  if (validatedJob.error) { const errors = validatedJob.error.issues; return res.status(400).json({ success: false, message: errors[0].message }) }

  const { job } = validatedJob.data

  try {
    const job_Overview = await Job.findOne({ _id: job })
    if (!job_Overview) return res.status(404).json({ success: false, message: "Job doesn't exist" })

    return res.status(200).json({
      success: true, 
      job_Overview
    })
  } catch (error) {
    instanceErrors(error, res)
  }
}




// Location:
export const AddLocation = async (req: Request, res: Response) => {
  const validatedData = LocationSchema.safeParse(req.body)
  if (validatedData.error) { const errors = validatedData.error.issues; return res.status(400).json({ success: false, message: errors[0].message }) }

  const { name } = validatedData.data

  // Sanitize XSS Title:
  const sanitizedName = filterXSS(name, { whiteList: {},
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
  if (validatedData.error) { const errors = validatedData.error.issues; return res.status(400).json({ success: false, message: errors[0].message }) }

  const { title } = validatedData.data

  // Sanitize XSS Title:
  const sanitizedTitle = filterXSS(title, { whiteList: {},
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
  const userId = req.user.id;

  try {
    const jobIds = await Job.find({ posted: userId }).distinct("_id");

    const Applications = await Application.find({
      job: { $in: jobIds.map(id => id.toString()) },
    })
    .populate("job")
    .populate("worker")
    .populate("location")
    .sort({ createdAt: -1 });

    if (!Applications.length) {
      return res.status(200).json({
        success: true,
        message: "No Applications",
        Applications: [],
      });
    }

    return res.status(200).json({
      success: true,
      Applications,
    });
  } catch (error) {
    mainError(error, res);
  }
};





// View Job Applications:
export const viewApplications = async (req: Request, res: Response) => {
  const validatedWorker = WorkerIDJob.safeParse({ worker: req.user.id })

  if (!validatedWorker.success) { const errors = validatedWorker.error.issues; return res.status(400).json({ success: false, message: errors[0].message }) }

  const { worker } = validatedWorker.data

  try {
    const Applications = await Application.find({ worker }).populate("job").populate("location").sort({ createdAt: -1 })
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
    
  const io = getIO();

  const validatedStatus = UpdateApplication.safeParse(req.body);
  const validatedEmployer = employerIdSchema.safeParse({ id: req.user.id, role: req.user.role })

  if (!validatedStatus.success) {
    const errors = validatedStatus.error.issues;
    return res.status(400).json({
      success: false,
      message: errors[0].message,
    });
  }

  if (!validatedEmployer.success) {
    const errors = validatedEmployer.error.issues;
    return res.status(400).json({
      success: false,
      message: errors[0].message,
    });
  }

  const { _id, status, timeline } = validatedStatus.data;
  const { id } = validatedEmployer.data;

  try {
    const application = await Application.findOne({ _id });
    if (!application)
      return res.status(404).json({ success: false, message: "Application not found" });

    const job = await Job.findById(application.job);
    if (!job)
      return res.status(404).json({ success: false, message: "Job not found" });

    const employer = await Employer.findOne({ _id: id })
    if (!employer)
      return res.status(404).json({ success: false, message: "Employer not found" })

    const previousStatus = application.status;
    const newStatus = status;

    // CASE 1: not accepted → accepted
    if (previousStatus !== "Accepted" && newStatus === "Accepted") {
      await Job.updateOne(
        { _id: job._id, positions: { $gt: 0 } },
        { $inc: { positions: -1 } }
      );

      await ApplicationAccepted.create({ job: job._id, jobCreatedAt: job.createdAt })
    }

    // CASE 2: accepted → not selected (rollback slot)
    if (previousStatus === "Accepted" && newStatus === "Not Selected") {
      await Job.updateOne(
        { _id: job._id },
        { $inc: { positions: 1 } }
      );
    }

    if (previousStatus === newStatus) {
      return res.status(200).json({
        success: true,
        message: "No changes applied",
      });
    }

    application.status = newStatus;
    application.timeline = timeline;

    await application.save();

    const notifications = new UserNotification(
      UpdateApplicationPayload(
        status,
        employer.email,
        new Date(),
        application.worker,
        job.title
      )
    );

    await notifications.save();
    
    console.log(
      "Worker room:",
      application.worker.toString()
    );

    console.log(
      "Emitting to room:",
      application.worker.toString()
    );

    io.to(application.worker.toString()).emit(
      "notification:worker:new",
      notifications
    );

    return res.status(200).json({
      success: true,
      message: "Application successfully updated!",
    });
  } catch (error) {
    mainError(error, res);
  }
};



// Update Interview Date:
export const UpdateInterview = async (req: Request, res: Response) => {
  const validatedDate = InterviewDate.safeParse(req.body)
  if (!validatedDate.success) { const errors = validatedDate.error._zod.def; return res.status(400).json({ success: false, message: errors[0].message })}

  const { _id, interviewDate } = validatedDate.data

  // interviewDate is expected to be "YYYY-MM-DD"
  const selectedDate = new Date(interviewDate)
  const today = new Date()

  // Remove time so today is accepted
  today.setHours(0, 0, 0, 0)
  selectedDate.setHours(0, 0, 0, 0)

  if (selectedDate < today) {
    return res.status(400).json({
      success: false,
      message: "Interview date cannot be in the past."
    })
  }
  
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

  const validatedEmployer = EmployerIdSchema.safeParse({ userId: req.user.id })

  if (!validatedEmployer.success) {
    const errors = validatedEmployer.error.issues;
    return res.status(400).json({
      success: false,
      message: errors[0].message
    })
  }

  const { userId } = validatedEmployer.data

  try {
    const employer = await Employer.findById(userId);
    if (!employer) return res.status(404).json({ success: false })

    const CompanyInformation = await Company.findOne({ name: employer.company }).populate("industry")
    if (!CompanyInformation) return res.status(404).json({ success: false, message: "Company not available" })

    const TotalApplications = await Application.find({ company: employer.company })
    const Employees = await Application.find({ company: employer.company, timeline: "Final Decision", status: "Accepted" })

    const result = await Job.aggregate([
      { $match: { company: employer.company, status: "ACCEPTED" } },
      { $group: { _id: null, total: { $sum: "$positions" } } }
    ]);

    const OpenPositionsLength = result[0]?.total || 0;

    return res.status(200).json({
      success: true,
      CompanyInformation,
      TotalApplications: TotalApplications.length,
      OpenPositionsLength, Employees: Employees.length
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
    // Jobs posted by the employer
    const jobs = await Job.find(
      { 
        posted: req.user.id,
        status: "ACCEPTED"
      },
      "_id"
    );

    const jobIds = jobs.map((job) => job._id);

    // Workers who applied to those jobs
    const applications = await Application.find({
      job: { $in: jobIds },
      timeline: "Final Decision",
      status: "Accepted"
    }).select("worker");

    const workerIds = [
      ...new Set(applications.map((app) => app.worker.toString())),
    ];

    // Worker information
    const workers = await Worker.find({
      _id: { $in: workerIds },
      status: "active",
    }).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true, workers,
    });
  } catch (error) {
    mainError(error, res);
  }
};

// Log Out Controller:
export const LogOut = async (req: Request, res: Response) => {
  try {
    return res.clearCookie("token").status(200).json({ success: true, message: "Successfully Logged Out!" })
  } catch (error) {
    return res.status(500).json({ success: false, message: "Internal Server Error"
    })
  }
}
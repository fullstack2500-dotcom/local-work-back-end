import { Request, Response } from "express";
import { ApplicationSchema, CompanySchema, JobOverviewSchema, EmployerIdSchema, JobSchema, LocationSchema, TagSchema, employerIdSchema, ViewProfile, WorkerIDJob, JobIDJob, ApplicationStatusUpdate, OnlyAccepted, UpdateApplication, InterviewDate, CompanySchemaID, IsAppliedS, WorkerID, TimeLineStatus, UpdateWorkerSchema, UpdateEmployerSchema, EmployerProfileS, RatingSchema, PostContacts, EmployerSchemaid, SkillID } from "../validator/protected";
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
  req.body.posted 
    = req.user.id

  const validatedUser = employerIdSchema.safeParse({ id: req.body.posted, role: req.user.role })
  if (validatedUser.error) { const error = validatedUser.error.issues; return res.status(400).json({ success: false, message: error[0].message }) }

  const { id, role } = validatedUser.data

  const details = await Employer.findOne({ _id: id, role })
  if (!details) return res.status(404).json({ success: false, message: "Employer not found" })
  console.log(details.email, details.phone)

  req.body.email = details.email
  req.body.phone = details.phone
  req.body.company = req.user.company

  const validatedJobData = JobSchema.safeParse(req.body)
  if (validatedJobData.error) { const error = validatedJobData.error.issues; return res.status(400).json({ success: false, message: error[0].message }) }

  const payload = validatedJobData.data

  // Sanitize XSS: Link - https://medium.com/@ferrosful/nodejs-security-unleashed-exploring-xss-attack-8d3a61a01a09:   // Will log `**Hello,world!**` - console.log(`text: ${html.replace(/\\s/g, '')}`); - Commented for the source
  payload.title = filterXSS(payload.title, { whiteList: {}, stripIgnoreTag: true, stripIgnoreTagBody: true })
  payload.description = filterXSS(payload.description, { whiteList: {}, stripIgnoreTag: true, stripIgnoreTagBody: true })
  payload.schedule = filterXSS(payload.schedule, { whiteList: {}, stripIgnoreTag: true, stripIgnoreTagBody: true })
  payload.salary = filterXSS(payload.salary, { whiteList: {}, stripIgnoreTag: true, stripIgnoreTagBody: true })
  payload.category = filterXSS(payload.category, { whiteList: {}, stripIgnoreTag: true, stripIgnoreTagBody: true })


  for (let i = 0; i < payload.tags.length; i++) { payload.tags[i] = filterXSS(payload.tags[i], { whiteList: {}, stripIgnoreTag: true, stripIgnoreTagBody: true }) }
  for (let i = 0; i < payload.requirements.length; i++) { payload.requirements[i] = filterXSS(payload.requirements[i], { whiteList: {}, stripIgnoreTag: true, stripIgnoreTagBody: true }) }
  for (let i = 0; i < payload.benefits.length; i++) {
    payload.benefits[i] = filterXSS(payload.benefits[i], { whiteList: {}, stripIgnoreTag: true, stripIgnoreTagBody: true })
  }

  try {
    if (!payload.tags.length) return res.status(400).json({ success: false, message: "Tags should not be empty" })
      
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





// Get Industries:
export const GetIndustries = async (req: Request, res: Response) => {
  try {
    const industries = await Industry.find().sort({ createdAt: -1 });

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



// Post a Contact:
export const PostContact = async (req: Request, res: Response) => {
  const validatedData = PostContacts.safeParse({ ...req.body, employer: req.user.id })
  if (!validatedData.success) { const errors = validatedData.error._zod.def; return res.status(400).json({ success: false, message: errors[0].message })}

  const { employer, title, description, worker } = validatedData.data

  try {
    const Title = filterXSS(title, { whiteList: {}, stripIgnoreTag: true, stripIgnoreTagBody: true })
    const Description = filterXSS(description, { whiteList: {}, stripIgnoreTag: true, stripIgnoreTagBody: true })

    const newContact = new Contact({ employer, title: Title, description: Description, worker })
    await newContact.save()

    return res.status(201).json({
      success: true,
      message: "Contact successfully added!"
    })
  } catch (error) {
    instanceErrors(
      error,
      res
    )
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
    if (!WorkerProf) return res.status(404).json({ success: false, message: "Worker doesn't exist"})

    const validatedS = SkillID.safeParse({ skill: WorkerProf.skill })
    if (!validatedS.success) { const errors = validatedS.error.issues; return res.status(400).json({ success: false, message: errors[0].message })}

    const applications = await Application.find({ worker: _id }).sort({ createdAt: -1 })
    const skills = await Skill.find().sort({ createdAt: -1 })
    const interviews = await Application.find({ worker: _id, status, timeline })

    const { skill } = validatedS.data
    const SkillInformation = await Skill.findOne({ title: skill })

    if (!SkillInformation) return res.status(404).json({ success: false, message: "Skill doesn't exist" })

    return res.status(200).json({
      success: true,
      WorkerProf,
      Applications: applications.length,
      Interviews: interviews.length,
      Locations: locations,
      Skills: skills,
      SkillInformation: WorkerProf.skill
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

    console.log(provincesRes.data);

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



// Update Worker:
export const UpdateWorker = async (req: Request, res: Response) => {
  const validatedWorker = UpdateWorkerSchema.safeParse({ ...req.body, _id: req.user.id })
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

    // ADD THIS
    if (req.file) {
      WorkerInfo.photo = `/uploads/profile/${req.file.filename}`;
    }

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


// Update Employer:
export const UpdateEmployer = async (req: Request, res: Response) => {
  const validatedEmployer = UpdateEmployerSchema.safeParse({
    ...req.body,
    _id: req.user.id
  });

  if (!validatedEmployer.success) {
    const errors = validatedEmployer.error._zod.def;
    return res.status(400).json({ success: false, message: errors[0].message });
  }

  const { _id, company, phone, industry } = validatedEmployer.data;

  try {
    const EmployerInformation = await Employer.findById(_id);
    if (!EmployerInformation) {
      return res.status(404).json({
        success: false,
        message: "Employer Not Found"
      });
    }

    if (company) EmployerInformation.company = company;
    if (phone) EmployerInformation.phone = phone;

    if (industry) {
      EmployerInformation.industry = new Types.ObjectId(industry);
    }

    await EmployerInformation.save();

    return res.status(200).json({
      success: true,
      message: "Employer has successfully been updated!"
    });

  } catch (error) {
    mainError(error, res);
  }
};



// View Employer Profile:
export const EmployerProfileController = async (req: Request, res: Response) => {
  const validatedEmployer = EmployerProfileS.safeParse({ _id: req.user.id })
  if (!validatedEmployer.success) { const errors = validatedEmployer.error._zod.def; return res.status(400).json({ success: false, message: errors[0].message })}

  const { _id } = validatedEmployer.data

  try {
    const EmployerProf = await Employer.findOne({ _id })
    const Industries = await Industry.find().sort({ createdAt: -1 })
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



// View Posted Jobs:
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
  const validatedStatus = UpdateApplication.safeParse(req.body);

  if (!validatedStatus.success) {
    const errors = validatedStatus.error.issues;
    return res.status(400).json({
      success: false,
      message: errors[0].message,
    });
  }

  const { _id, status, timeline } = validatedStatus.data;

  try {
    const application = await Application.findOne({ _id });
    if (!application)
      return res.status(404).json({ success: false, message: "Application not found" });

    const job = await Job.findById(application.job);
    if (!job)
      return res.status(404).json({ success: false, message: "Job not found" });

    const previousStatus = application.status;
    const newStatus = status;

    // CASE 1: not accepted → accepted
    if (previousStatus !== "Accepted" && newStatus === "Accepted") {
      await Job.updateOne(
        { _id: job._id, positions: { $gt: 0 } },
        { $inc: { positions: -1 } }
      );
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

  if (!validatedCompany.success) {
    const errors = validatedCompany.error.issues;
    return res.status(400).json({
      success: false,
      message: errors[0].message
    })
  }

  const { _id } = validatedCompany.data

  try {
    const CompanyInformation = await Company.findOne({ name: _id }).populate("industry")
    if (!CompanyInformation) return res.status(404).json({ success: false, message: "Company not available" })

    const TotalApplications = await Application.find({ company: _id })
    const Employees = await Application.find({ company: _id, timeline: "Final Decision", status: "Accepted" })

    const result = await Job.aggregate([
      { $match: { company: _id } },
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
    return res.clearCookie("token").status(200).json({ success: true, message: "Successfully Logged Out!" })
  } catch (error) {
    return res.status(500).json({ success: false, message: "Internal Server Error"
    })
  }
}
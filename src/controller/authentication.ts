import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import { WorkerRegisterSchema, EmployerSchema, LoginSchema, AdminSchema, AdminLoginSchema, OnlyAccepted } from "../validator/authentication";
import jwt from "jsonwebtoken"
import Worker from "../model/Worker";
import { instanceErrors, mainError } from "../errors/showErrors";
import Admin from "../model/Admin";
import Employer from "../model/Employer";
import Job from "../model/Job";
import Skill from "../model/Skill";
import Industry from "../model/Industry";
import Rating from "../model/Rating";
import { filterXSS } from "xss";



// File Display:
export const displayFile = async (req: Request, res: Response) => {
  return res.status(200).json({
    success: true
  })
}



// Register Admin:
export const AdminRegister = async (req: any, res: Response) => {
  const validatedData = AdminSchema.safeParse(req.body)
  if (validatedData.error) { const errors = validatedData.error._zod.def; return res.status(400).json({ success: false, message: errors[0].message }) }

  const { name, email, password, role } = validatedData.data;

  try {
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newAdmin = new Admin({ name, email, password: hashedPassword, role });
    await newAdmin.save();

    return res.status(201).json({
      success: true,
      message: "Admin Successfully Registered!"
    });
  } catch (error: unknown) {
    instanceErrors(
      error,
      res
    )
  }
}



// Login Admin:
export const AdminLogin = async (req: Request, res: Response) => {
  const validatedData = AdminLoginSchema.safeParse(req.body)
  if (validatedData.error) { const errors = validatedData.error._zod.def; return res.status(400).json({ success: false, message: errors[0].message }) }

  const { email, password } = validatedData.data;

  try {
    const admin = await Admin.findOne({ email })
    if (!admin) return res.status(400).json({ success: false, message: "Invalid email / password"});

    const Match = await bcrypt.compare(password, admin.password)
    if (!Match) return res.status(400).json({ success: false, message: "Invalid email / password"});

    const token = jwt.sign({ id: admin._id, role: admin.role }, process.env.JWT_SECRET as string, { expiresIn: '1h' })
    res.cookie('token', token, { expires: new Date(Date.now() + 60 * 60 * 1000), httpOnly: true, sameSite: 'strict' })

    return res.status(200).json({
      success: true,
      message: "Login Successful!"
    })
  } catch (error) {
    mainError(
      error,
      res
    )
  }
}



export const WorkerRegister = async (req: Request, res: Response) => {
  try {
    const files = req.files as {
      [fieldname: string]: Express.Multer.File[];
    };

    const resume = files?.resume?.[0];
    const photo = files?.photo?.[0];

    // REQUIRED RESUME CHECK
    if (!resume) {
      return res.status(400).json({
        success: false,
        message: "Resume is required",
      });
    }

    const payload = {
      ...req.body,
      resume: resume.filename,
      photo: photo?.filename || null,
    };

    const validatedData = WorkerRegisterSchema.safeParse(payload);

    if (!validatedData.success) {
      return res.status(400).json({
        success: false,
        message: validatedData.error.issues[0].message,
      });
    }

    const {
      name,
      email,
      phoneNumber,
      password,
      role,
      skills,
      skill,
      resume: resumeFile,
      photo: photoFile,
    } = validatedData.data;

    const hash = await bcrypt.hash(password, 12);

    const newWorker = new Worker({
      name,
      email,
      phoneNumber,
      password: hash,
      role,
      skills,
      skill,
      resume: resumeFile,
      photo: photoFile,
    });

    await newWorker.save();

    const token = jwt.sign(
      {
        id: newWorker._id,
        role: newWorker.role,
        status: newWorker.status,
      },
      process.env.JWT_SECRET as string,
      { expiresIn: "1h" }
    );

    res.cookie("token", token, {
      httpOnly: true,
      sameSite: "strict",
      secure: process.env.NODE_ENV === "production",
      expires: new Date(Date.now() + 60 * 60 * 1000),
    });

    return res.status(201).json({
      success: true,
      message: "Worker Successfully Registered!",
    });
  } catch (error) {
    instanceErrors(error, res);
  }
};



// Display Reviews:
export const Reviews = async (req: Request, res: Response) => {
  try {
    const ReviewsDta = await Rating.find().populate("worker").populate("skill").sort({ createdAt: -1 })
    if (!ReviewsDta.length) return res.status(200).json({ success: true, ReviewsDta, message: "No Reviews yet." })

    return res.status(200).json({
      success: true,
      ReviewsDta
    })
  } catch (error) {
    mainError(
      error,
      res
    )
  }
}



// Register the Employer:
export const EmployerRegister = async (req: Request, res: Response) => {
  const validatedData = EmployerSchema.safeParse(req.body);

  if (validatedData.error) {
    const errors = validatedData.error.issues;
    return res.status(400).json({
      success: false,
      message: errors[0].message,
    });
  }

  const { company, email, password, phone, industry } = validatedData.data;
  const permitFile = req.file;

  if (!permitFile) {
    return res.status(400).json({
      success: false,
      message: "Business permit is required",
    });
  }

  const Company = filterXSS(company, {
    whiteList: {},
    stripIgnoreTag: true,
    stripIgnoreTagBody: true,
  });

  const Industry = filterXSS(industry, {
    whiteList: {},
    stripIgnoreTag: true,
    stripIgnoreTagBody: true,
  });

  try {
    const salt = await bcrypt.genSalt(12);
    const hash = await bcrypt.hash(password, salt);

    const newEmployer = new Employer({
      company: Company,
      email,
      password: hash,
      phone,
      industry: Industry,
      permit: permitFile.filename, // ✅ STORE FILE HERE
    });

    await newEmployer.save();

    const token = jwt.sign(
      {
        id: newEmployer._id,
        role: newEmployer.role,
        company: newEmployer.company,
        status: newEmployer.status,
      },
      process.env.JWT_SECRET as string,
      { expiresIn: "1h" }
    );

    res.cookie("token", token, {
      expires: new Date(Date.now() + 60 * 60 * 1000),
      httpOnly: true,
      sameSite: "strict",
    });

    return res.status(200).json({
      success: true,
      message: "Employer Registered Successfully!",
    });
  } catch (error: unknown) {
    instanceErrors(error, res);
  }
};



// Login Controller:
export const EmployerLogin = async (req: Request, res: Response) => {
  const validatedData = LoginSchema.safeParse(req.body)

  if (validatedData.error) { const errors = validatedData.error.issues; return res.status(400).json({ success: false, message: errors[0].message })}

  const { email, password, role } = validatedData.data

  try {
    const user = await Employer.findOne({ email }).select("+password")
    if (!user) return res.status(400).json({ success: false, message: "Incorrect Email / Password" })

    const isMatch = await bcrypt.compare(password, user.password)
    if (!isMatch) return res.status(400).json({ success: false, message: "Incorrect Email / Password" })

    const verify = await Employer.findOne({ email: user.email, role })
    if (!verify) return res.status(400).json({ success: false, message: "Incorrect Email / Password" })

    if (user.status === "deleted" || user.status === "pending" || user.status === "not_active") return res.status(400).json({ success: false, message: "Incorrect Email / Password" })

    const token = jwt.sign({ id: user._id, role: user.role, company: user.company, status: user.status }, process.env.JWT_SECRET as string, {
      expiresIn: '1h'
    })

    res.cookie('token', token, { expires: new Date(Date.now() + 60 * 60 * 1000), httpOnly: true, sameSite: 'strict' })
    console.log(req.cookies)

    return res.status(200).json({
      success: true,
      message: "Login Successful!"
    })
  } catch (error) {

    mainError(
      error, res
    )
  }
}



// Login Controller:
export const WorkerLogin = async (req: Request, res: Response) => {
  const validatedData = LoginSchema.safeParse(req.body)

  if (validatedData.error) { const errors = validatedData.error.issues; return res.status(400).json({ success: false, message: errors[0].message })}

  // Validated email and password:
  const { email, password, role } = validatedData.data

  try {
    const user = await Worker.findOne({ email })
    if (!user) return res.status(400).json({ success: false, message: "Incorrect Email / Password" })

    const isMatch = await bcrypt.compare(password, user.password)
    if (!isMatch) return res.status(400).json({ success: false, message: "Incorrect Email / Password" })

    const verify = await Worker.findOne({ email: user.email, role })
    if (!verify) return res.status(400).json({ success: false, message: "Incorrect Email / Password" })
    
    if (user.status === "deleted" || user.status === "pending" || user.status === "not_active") return res.status(400).json({ success: false, message: "Incorrect Email / Password" })

    const token = jwt.sign({ id: user._id, role: user.role, status: user.status }, process.env.JWT_SECRET as string, {
      expiresIn: '1h'
    })

    res.cookie('token', token, { expires: new Date(Date.now() + 60 * 60 * 1000), httpOnly: true, sameSite: 'strict' })
    console.log(req.cookies)

    return res.status(200).json({
      success: true,
      message: "Login Successful!"
    })
  } catch (error) {

    mainError(
      error, res
    )
  }
}



// For the FindJobs:
export const FindJobs = async (req: Request, res: Response) => {
  const validatedApp = OnlyAccepted.safeParse({ status: "ACCEPTED" })
  if (!validatedApp.success) { const errors = validatedApp.error._zod.def; return res.status(400).json({ success: false, message: errors[0].message })}

  const { status } = validatedApp.data
  let jobArray = []

  try {
    const jobs = await Job.find({ status }).populate("location").sort({ createdAt: -1 })
    if (!jobs.length) return res.status(200).json({ success: true, jobs, message: "No jobs available" })

    for (let job = 0; job < jobs.length; job++) {
      jobArray.push({ info: jobs[job], IsApplied: false })
    }

    return res.status(200).json({
      success: true,
      jobs: jobArray
    })
  } catch (error) {
    mainError(
      error, 
      res
    )
  }
}



// View Skills:
export const ViewSkills = async (req: Request, res: Response) => {
  try {
    const skills = await Skill.find()
    if (!skills.length) return res.status(200).json({ success: true, message: "No Skills Yet" })

    return res.status(200).json({
      success: true,
      skills
    })
  } catch (error: unknown) {
    mainError(
      error, 
      res
    )
  }
}



// Display Dropdown Companies:
export const DropdownComp = async (req: Request, res: Response) => {
  try {
    const Industries = await Industry.find().sort({ createdAt: -1 })

    if (!Industries.length) return res.status(200).json({ success: true, Industries, message: "No Industries"})

    return res.status(200).json({
      success: true,
      Industries
    })
  } catch (error) {
    mainError(
      error,
      res
    )
  }
}



// Display Workers:
export const Workers = async (req: Request, res: Response) => {
  try {
    const Workers = await Worker.find({ status: "accepted" }).populate("location").sort({ createdAt: -1 })
    if (!Workers.length) return res.status(200).json({ success: true, Workers, message: "No Workers Available" })

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
import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import { WorkerRegisterSchema, EmployerSchema, LoginSchema, AdminSchema, AdminLoginSchema, OnlyAccepted } from "../validator/authentication";
import jwt from "jsonwebtoken"
import Worker from "../model/Worker";
import { instanceErrors, mainError } from "../errors/showErrors";
import Admin from "../model/Admin";
import { resume } from "../file/upload";
import Employer from "../model/Employer";
import Job from "../model/Job";
import Skill from "../model/Skill";
import { AddCompanyOwner } from "../validator/authentication";
import CompanyOwner from "../model/CompanyOwner";
import Company from "../model/Company";
import Industry from "../model/Industry";
import Rating from "../model/Rating";




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




export const uploadResume = async (req: any, res: any) => {
  resume(req, res, (err) => {
      if (err) { console.error(err); return res.status(500).json({ error: err }); }
      if (!req.file) return res.status(400).json({ error: 'Please send file' });

      console.log(req.file);
      res.send('File uploaded!');
    });
}





// Register The User:
export const WorkerRegister = async (req: Request, res: Response) => {
  const validatedData = WorkerRegisterSchema.safeParse(req.body)
  if (validatedData.error) {
    const errors = validatedData.error.issues
    return res.status(400).json({
        success: false,
            message: errors[0].message
    })
  }

  const { name, email, phoneNumber, password, role, skills, skillCategory, photo, resume } = validatedData.data;

  try {
    const hash = await bcrypt.hash(password, 12);
    const newWorker = new Worker({ name, email, phoneNumber, password: hash, role, skills, skillCategory, photo, resume })
    
    await newWorker.save()

    const token = jwt.sign({ id: newWorker._id, role: newWorker.role }, process.env.JWT_SECRET as string, { expiresIn: '1h' })
    res.cookie('token', token, { expires: new Date(Date.now() + 60 * 60 * 1000), httpOnly: true, sameSite: 'strict' })

    return res.status(201).json({
      success: true,
      message: "Worker Successfully Registered!"
    })

  } catch (error: unknown) {

    instanceErrors(
      error,
      res
    )
  }
}



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



// Register The User:
export const EmployerRegister = async (req: Request, res: Response) => {
  const validatedData = EmployerSchema.safeParse(req.body)
  if (validatedData.error) { const errors = validatedData.error.issues; return res.status(400).json({ success: false, message: errors[0].message }) }

  const { company, email, password, phone, industry, permit } = validatedData.data

  try {
    const salt = await bcrypt.genSalt(12)
    const hash = await bcrypt.hash(password, salt)

    const newEmployer = new Employer({ company, email, password: hash, phone, industry, permit })
    await newEmployer.save()

    const token = jwt.sign({ id: newEmployer._id, role: newEmployer.role, company: newEmployer.company }, process.env.JWT_SECRET as string, { expiresIn: '1h' })
    res.cookie('token', token, { expires: new Date(Date.now() + 60 * 60 * 1000), httpOnly: true, sameSite: 'strict' })

    return res.status(200).json({
      success: true,
      message: "Employee Registered Successfully!"
    })
  } catch (error: unknown) {
    instanceErrors(
      error,
      res
    )
  }
}





// Login Controller:
export const EmployerLogin = async (req: Request, res: Response) => {
  const validatedData = LoginSchema.safeParse(req.body)

  if (validatedData.error) {
    const errors = validatedData.error.issues
    return res.status(400).json({
        success: false,
            message: errors[0].message
    })
  }

  // Validated email and password:
  const {
    email,
    password,
    role
  } = validatedData.data

  try {
    const user = await Employer.findOne({ email }).select("+password")
    if (!user) return res.status(400).json({ success: false, message: "Incorrect Email / Password" })

    const isMatch = await bcrypt.compare(password, user.password)
    if (!isMatch) return res.status(400).json({ success: false, message: "Incorrect Email / Password" })

    const verify = await Employer.findOne({ email: user.email, role })
    if (!verify) return res.status(400).json({ success: false, message: "Incorrect Email / Password" })

    const token = jwt.sign({ id: user._id, role: user.role, company: user.company }, process.env.JWT_SECRET as string, {
      expiresIn: '1h'
    })

    res.cookie('token', token, {
      expires: new Date(Date.now() + 60 * 60 * 1000),
      httpOnly: true,
      sameSite: 'strict'
    })
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

  if (validatedData.error) {
    const errors = validatedData.error.issues
    return res.status(400).json({
        success: false,
            message: errors[0].message
    })
  }

  // Validated email and password:
  const {
    email,
    password,
    role
  } = validatedData.data

  try {
    const user = await Worker.findOne({ email })
    if (!user) return res.status(400).json({ success: false, message: "Incorrect Email / Password" })

    const isMatch = await bcrypt.compare(password, user.password)
    if (!isMatch) return res.status(400).json({ success: false, message: "Incorrect Email / Password" })

    const verify = await Worker.findOne({ email: user.email, role })
    if (!verify) return res.status(400).json({ success: false, message: "Incorrect Email / Password" })

    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET as string, {
      expiresIn: '1h'
    })

    res.cookie('token', token, {
      expires: new Date(Date.now() + 60 * 60 * 1000),
      httpOnly: true,
      sameSite: 'strict'
    })
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

  try {
    const jobs = await Job.find({ status }).populate("location").sort({ createdAt: -1 })
    if (!jobs.length) return res.status(200).json({ success: true, jobs, message: "No jobs available" })

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
    const Companies = await Company.find().sort({ createdAt: -1 })
    const Industries = await Industry.find().sort({ createdAt: -1 })
    if (!Companies.length) return res.status(200).json({ success: true, Companies, Industries, message: "No Companies Available" })
    if (!Industries.length) return res.status(200).json({ success: true, Companies, Industries, message: "No Industries"})

    return res.status(200).json({ success: true, Companies, Industries })
  } catch (error) {
    mainError(
      error,
      res
    )
  }
}







export const AddNewCompanyOwner = async (req: Request, res: Response) => {
  const validatedEmail = AddCompanyOwner.safeParse(req.body)
  if (!validatedEmail.success) { const errors = validatedEmail.error._zod.def; return res.status(400).json({ success: false, message: errors[0].message })}

  const { email, phone } = validatedEmail.data

  try {
    const newCompanyOwner = new CompanyOwner({ email, phone })
    await newCompanyOwner.save()

    return res.status(201).json({
      success: true,
      message: "Company Owner Successfully Added!"
    })
  } catch (error) {
    instanceErrors(
      error,
      res
    )
  }
}





// Display Workers:
export const Workers = async (req: Request, res: Response) => {
  try {
    const Workers = await Worker.find().populate("location").sort({ createdAt: -1 })
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
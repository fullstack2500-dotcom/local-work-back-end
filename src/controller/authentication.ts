import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import { WorkerRegisterSchema, EmployerSchema, LoginSchema, AdminSchema, AdminLoginSchema } from "../validator/authentication";
import jwt from "jsonwebtoken"
import Worker from "../model/Worker";
import { instanceErrors, mainError } from "../errors/showErrors";
import Admin from "../model/Admin";
import { resume } from "../file/upload";
import Employer from "../model/Employer";




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

  const { name, email, phoneNumber, password, role, skill, photo, resume } = validatedData.data;

  try {
    const hash = await bcrypt.hash(password, 12);
    const newUser = new Worker({ name, email, phoneNumber, password: hash, role, skill, photo, resume })
    
    await newUser.save()

    return res.status(201).json({
      success: true,
      message: "User Successfully Registered!"
    })

  } catch (error: unknown) {

    instanceErrors(
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
export const Login = async (req: Request, res: Response) => {
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








// // Total Workers:
// export const TotalWorkers = async (req: Request, res: Response) => {
//   const validatedRole = TotalWorkerSchemaMain.safeParse({ role: "worker" })

//   if (validatedRole.error) {
//     const errors = validatedRole.error.issues
//     return res.status(400).json({

//       success: false,
//       message: errors[0].message
//     })
//   }

//   const { role } = validatedRole.data

//   try {
//     const workers = await Worker.find({ role })
//     const localWorkers = workers.length

//     if (localWorkers > 500) { return res.status(200).json({ success: true, localWorkers: "500+" }) }
//     else { return res.status(200).json({ success: true, localWorkers }) }

//   } catch (error) {
//     mainError(
//       error, res
//     )
//   }
// }
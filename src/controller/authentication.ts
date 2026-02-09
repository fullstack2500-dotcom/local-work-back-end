import { Request, Response } from "express";
import User from "../model/User";
import bcrypt from "bcryptjs";
import { RegisterSchema, LoginSchema, TotalWorkerSchemaMain } from "../validator/authentication";
import jwt from "jsonwebtoken"
import { instanceErrors, mainError } from "../errors/showErrors";








// Register The User:
export const Register = async (req: Request, res: Response) => {
  const validatedData = RegisterSchema.safeParse(req.body)
  if (validatedData.error) {
    const errors = validatedData.error.issues
    return res.status(400).json({
        success: false,
            message: errors[0].message
    })
  }

  const { name, email, phoneNumber, password, role, skills, photo, resume, businessPermit } = validatedData.data;

  try {
    const hash = await bcrypt.hash(password, 12);
    const newUser = new User({ name, email, phoneNumber, password: hash, role, skills, files: {
      photo, resume
    }, businessPermit })
    
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
    const user = await User.findOne({ email })
    if (!user) return res.status(400).json({ success: false, message: "Incorrect Email / Password" })

    const isMatch = await bcrypt.compare(password, user.password)
    if (!isMatch) return res.status(400).json({ success: false, message: "Incorrect Email / Password" })

    const verify = await User.findOne({ email: user.email, role })
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








// Total Workers:
export const TotalWorkers = async (req: Request, res: Response) => {
  const validatedRole = TotalWorkerSchemaMain.safeParse({ role: "worker" })

  if (validatedRole.error) {
    const errors = validatedRole.error.issues
    return res.status(400).json({

      success: false,
      message: errors[0].message
    })
  }

  const { role } = validatedRole.data

  try {
    const workers = await User.find({ role })
    const localWorkers = workers.length

    if (localWorkers > 500) { return res.status(200).json({ success: true, localWorkers: "500+" }) }
    else { return res.status(200).json({ success: true, localWorkers }) }

  } catch (error) {
    mainError(
      error, res
    )
  }
}
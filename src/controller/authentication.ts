import { Request, Response } from "express";
import User from "../model/User";
import bcrypt from "bcryptjs";
import { RegisterSchema, LoginSchema, TotalWorkerSchemaMain } from "../validator/authentication";
import jwt from "jsonwebtoken"

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

  // Validated Data:
  const {
    name,
    email,
    password,
    role
  } = validatedData.data;

  // Try-catch error handling:
  try {
    const hash = await bcrypt.hash(password, 12);
    const newUser = new User({ name, email, password: hash, role })
    
    await newUser.save()

    return res.status(201).json({
      success: true,
      message: "User Successfully Registered!" 
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
    password
  } = validatedData.data

  try {
    const user = await User.findOne({ email })
    if (!user) return res.status(400).json({ success: false, message: "Invalid credentials!" })

    const isMatch = await bcrypt.compare(password, user.password)
    if (!isMatch) return res.status(400).json({ success: false, message: "Invalid credentials!" })

    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET as string, {
      expiresIn: '1h'
    })

    res.cookie('token', token, { httpOnly: true })
    console.log(req.cookies)

    return res.status(200).json({
      success: true,
      message: "Login Successful!"
    })
  } catch (error) {

    return res.status(500).json({
      success: false,
      message: "Internal Server Error"
    })
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
    console.error(error)

    return res.status(500).json({
      success: false,
      message: "Internal Server Error"
    })
  }
}
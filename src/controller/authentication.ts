import { Request, Response } from "express";
import User from "../model/User";
import Employer from "../model/Employer";
import bcrypt from "bcryptjs";
import { RegisterSchema, LoginSchema } from "../validator/authentication";
import jwt from "jsonwebtoken"

// Register The User:
export const Register = async (req: Request, res: Response) => {
  // Validate user information:
  const validatedData = RegisterSchema.safeParse(req.body)
  if (validatedData.error) {

    const errors = JSON.parse(validatedData.error.message)
    return res.status(400).json({ success: false, message: errors[0].message })
  }

  const { name, email, password, role } = validatedData.data;

  try {
    const hash = await bcrypt.hash(password, 12);
    const newUser = new User({ name, email, password: hash, role })

    // Save the user:
    await newUser.save()

    // If user is an employer:
    if (newUser.role === "employer") {
      const newEmployer = new Employer({ user: newUser._id })
      await newEmployer.save()
    }

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

    // Server Error:
    return res.status(500).json({
      success: false,
      message: "Internal Server Error"
    })
  }
}

// Login Controller:
export const Login = async (req: Request, res: Response) => {
  // Validate email and password:
  const validatedData = LoginSchema.safeParse(req.body)

  // If there is an error:
  if (validatedData.error) {
    const errors = JSON.parse(validatedData.error.message)
    return res.status(400).json({

      success: false,
      message: errors[0].message
    })
  }

  // Validated email and password:
  const { email, password } = validatedData.data

  try {
    // Verify email if it exists:
    const user = await User.findOne({ email })
    if (!user) return res.status(400).json({ success: false, message: "Invalid credentials!" })

    // Verify password:
    const isMatch = await bcrypt.compare(password, user.password)
    if (!isMatch) return res.status(400).json({ success: false, message: "Invalid credentials!" })

    // Generate the token:
    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET as string, {
      expiresIn: '1h'
    })

    // Return success message with token:
    return res.status(200).json({
      success: true,
      message: "Login Successful!",
      token
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal Server Error"
    })
  }
}
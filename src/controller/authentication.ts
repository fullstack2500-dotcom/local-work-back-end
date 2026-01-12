import { Request, Response } from "express";
import User from "../model/User";
import bcrypt from "bcryptjs";
import { RegisterSchema } from "../validator/authentication";

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
  }
}
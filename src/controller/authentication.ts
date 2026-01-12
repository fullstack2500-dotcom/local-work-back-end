import { Request, Response } from "express";
import User from "../model/User";
import bcrypt from "bcryptjs";

// Register The User:
export const Register = async (req: Request, res: Response) => {
  const { name, email, password, role } = req.body;

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
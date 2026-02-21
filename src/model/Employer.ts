import { Document, Schema, model } from "mongoose"

export interface IEmployer extends Document {
  company: string,
  email: string,
  password: string,
  phone: string,
  industry: string,
  profile: string,
  permit: string,
  status: string,
  role: string
}

const EmployerSchema: Schema = new Schema({
  company: { type: String, required: [true, "Company is required"] },
  email: { type: String, required: [true, "Email is required"], unique: [true, "Email is already in use"] },
  password: { type: String, required: [true, "Password is required"] },
  phone: { type: String, required: [true, "Phone is required"] },
  industry: { type: String, required: [true, "Industry is required"] },
  profile: { type: String, default: "default.jpg" },
  permit: { type: String, required: [true, "Permit is required"] },
  status: { type: String, default: "pending" },
  role: { type: String, enum: ["employer"], default: "employer" }
}, { timestamps: true })

export default model<IEmployer>("Employer", EmployerSchema)
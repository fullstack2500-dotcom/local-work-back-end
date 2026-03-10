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
  // Source - https://stackoverflow.com/a/12096922
// Posted by JohnnyHK, modified by community. See post 'Timeline' for change history
// Retrieved 2026-02-27, License - CC BY-SA 3.0

  company: { type: Schema.Types.ObjectId, ref: 'Company', required: [true, "Company is required"] },
  email: { type: String, required: [true, "Email is required"], unique: [true, "Email is already in use"] },
  password: { type: String, required: [true, "Password is required"], select: false },
  phone: { type: String, required: [true, "Phone is required"] },
  industry: { type: String, required: [true, "Industry is required"] },
  profile: { type: String, default: "default.jpg" },
  permit: { type: String },
  status: { type: String, default: "pending" },
  role: { type: String, enum: ["employer"], default: "employer" }
}, { timestamps: true })

export default model<IEmployer>("Employer", EmployerSchema)
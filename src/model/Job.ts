import { Document, Schema, ObjectId, model } from "mongoose";

export interface IJob extends Document {
  title: string,
  company: string,
  posted: string,
  location: string,
  type: string,
  salary: string,
  hoursNeeded: Number,
  description: string,
  tags: string[],
  requirements: string[],
  benefits: string[],
  schedule: string,
  startDate: string,
  status: string,
  positions: Number,
  applyBefore: string,
  contactEmail: string,
  contactPhone: string
}

const JobSchema: Schema = new Schema({
  title: { type: String, required: [true, "Title is required"], unique: [true, "Title must be unique"] },
  company: { type: String, required: [true, "Company is required"] },
  posted: { type: Schema.Types.ObjectId, ref: 'User', required: [true, "Employer ID is required"] },
  location: { type: String, required: [true, "Location is required"] },
  type: { type: String, enum: ["Part-Time", "Full-Time"], default: "Full-Time" },
  salary: { type: String, required: [true, "Salary is required"] },
  description: { type: String, required: [true, "Description is required"] },
  tags: [
    { type: String }
  ],
  requirements: [
    { type: String }
  ],
  benefits: [
    { type: String }
  ],
  schedule: { type: String },
  startDate: { type: String, default: "Immediate" },
  status: { type: String, default: "pending" },
  positions: { type: Number, required: [true, "Number of Positions required"] },
  applyBefore: { type: String },
  email: { type: String },
  phone: { type: String }
}, { timestamps: true })

export default model<IJob>("Job", JobSchema)
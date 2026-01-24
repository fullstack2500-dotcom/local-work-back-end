import { Document, Schema, model, ObjectId } from "mongoose";

export interface IJob {
  title: string,
  description: string,
  requirements: [],
  employerInformation: string,
  rating: Number,
  location: ObjectId,
  salaryPerDay: Number,
  hours: Number,
  type: string,
  status: string,
  review: string
}

const JobSchema: Schema = new Schema({
  title: { type: String, required: [true, "Title is required"], unique: ["Title is already exists"] },
  description: { type: String, required: [true, "Description is required"] },
  requirements: { type: [], default: [] },
  employerInformation: { type: String, required: [true, "Employer Information is required"] },
  rating: { type: Number, default: 0 },
  location: { type: Schema.Types.ObjectId },
  salaryPerDay: { type: Number, required: [true, "Salary is required"] },
  hours: { type: Number, required: [true, "Hours per day is required"] },
  type: { type: String, enum: ["ongoing", "approved"], default: "ongoing" },
  review: { type: String, default: "" }
})

export default model<IJob>("Job", JobSchema)
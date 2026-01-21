import { Schema, model, ObjectId } from "mongoose";

export interface IJob {
  title: string,
  description: string,
  requirements: [],
  employerInformation: string,
  rating: Number,
  location: ObjectId,
  salaryPerDay: Number,
  type: "ongoing" | "approved",
  status: string,
  review: string | null
}

const JobSchema = new Schema<IJob>({
  title: { type: String, required: [true, "Title is required"], unique: true },
  description: { type: String, required: [true, "Description is required"] },
  requirements: { type: [], default: [] },
  employerInformation: { type: String, required: [true, "Employer Information is required"] },
  rating: { type: Number, default: 0 },
  location: { type: Schema.ObjectId },
  salaryPerDay: { type: Number, required: [true, "Salary is required"] },
  type: { type: String, enum: ["ongoing", "approved"], default: "ongoing" },
  review: { type: String, default: null }
})

export default model<IJob>("Job", JobSchema)
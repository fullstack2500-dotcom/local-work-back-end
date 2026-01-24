import { Document, Schema, model, ObjectId } from "mongoose";

export interface IJob extends Document {
  title: string,
  description: string,
  postedBy: ObjectId, // The ObjectId of the Employer that made this Job
  requirements: [],
  rating: Number,
  location: ObjectId,
  salaryPerDay: Number,
  hours: Number,
  type: string,
  status: string,
  review: string,
  isAvailable: Boolean,
  accepted: [],
  pending: [],
  saved: []
}

const JobSchema: Schema = new Schema({
  title: { type: String, required: [true, "Title is required"], unique: ["Title is already exists"] },
  description: { type: String, required: [true, "Description is required"] },
  postedBy: { type: Schema.Types.ObjectId, ref: "User", required: [true, "Please enter a user"] },
  requirements: { type: [], default: [] },
  rating: { type: Number, default: 0 },
  location: { type: Schema.Types.ObjectId },
  salaryPerDay: { type: Number, required: [true, "Salary is required"] },
  hours: { type: Number, required: [true, "Hours per day is required"] },
  type: { type: String, enum: ["Part Time", "Full Time"], default: "Full Time" },
  review: { type: String, default: "" },
  isAvailable: { type: Boolean, default: true },
  accepted: { type: [], default: [] }, // Users that applied this job [If User was accepted, remove their userID via the pending and transfer it to this]
  pending: { type: [], default: [] }, // Pending users application [Users will first be in this array]
  saved: { type: [], default: [] } // Users that saved this job
}, { timestamps: true })

export default model<IJob>("Job", JobSchema)
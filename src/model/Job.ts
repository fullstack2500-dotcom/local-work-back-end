import { Document, Schema, model, ObjectId } from "mongoose";

export interface IJob extends Document {
  title: string,
  description: string,
  postedBy: ObjectId, // The ObjectId of the Employer that made this Job
  rating: Number,
  location: ObjectId,
  salaryPerDay: Number,
  hours: Number,
  type: string,
  status: string,
  review: string,
  isAvailable: Boolean
}

const JobSchema: Schema = new Schema({
  title: { type: String, required: [true, "Title is required"], unique: ["Title is already exists"] },
  description: { type: String, required: [true, "Description is required"] },
  postedBy: { type: Schema.Types.ObjectId, ref: "User", required: [true, "Please enter a user"] },
  rating: { type: Number, default: 0 },
  location: { type: Schema.Types.ObjectId },
  salaryPerDay: { type: Number, required: [true, "Salary is required"] },
  hours: { type: Number, required: [true, "Hours per day is required"] },
  type: { type: String, enum: ["Part Time", "Full Time"], default: "Full Time" },
  status: { type: String, enum: ["ongoing", "approved"], default: "ongoing" },
  review: { type: String, default: "" },
  isAvailable: { type: Boolean, default: true }
}, { timestamps: true })

export default model<IJob>("Job", JobSchema)
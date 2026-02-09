import { Document, Schema, ObjectId, model } from "mongoose";

export interface IJob extends Document {
  title: string,
  companyName: string,
  company: string,
  postedBy: string,
  location: string,
  locationName: string,
  type: string,
  salaryRangeMin: Number,
  salaryRangeMax: Number,
  hoursNeeded: Number,
  description: string
}

const JobSchema: Schema = new Schema({
  title: { type: String, required: [true, "Title is required"], unique: [true, "Title must be unique"] },
  companyName: { type: Schema.Types.ObjectId, ref: 'Companie', required: [true, "Company is required"] },
  company: { type: String },
  postedBy: { type: Schema.Types.ObjectId, ref: 'User', required: [true, "Employer ID is required"] },
  location: { type: Schema.Types.ObjectId, ref: 'Location', required: [true, "Location is required"] },
  locationName: { type: String },
  type: { type: String, enum: ["Part-Time", "Full-Time"], default: "Full-Time" },
  salaryRangeMin: { type: Number, required: [true, "Salary Range Min is required"] },
  salaryRangeMax: { type: Number, required: [true, "Salary Range Max is required"] },
  hoursNeeded: { type: Number, required: [true, "Hours Needed is required"] },
  description: { type: String, required: [true, "Description is required"] }
}, { timestamps: true })

export default model<IJob>("Job", JobSchema)
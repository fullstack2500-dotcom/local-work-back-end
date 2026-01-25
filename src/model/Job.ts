import { Document, Schema, ObjectId, model } from "mongoose";

export interface IJob extends Document {
  title: string,
  postedBy: ObjectId,
  type: string,
  salaryPerDay: Number,
  hoursNeeded: Number,
  description: string
}

const JobSchema: Schema = new Schema({
  title: { type: String, required: [true, "Title is required"], unique: [true, "Title must be unique"] },
  postedBy: { type: Schema.Types.ObjectId, required: [true, "Employer ID is required"] },
  type: { type: String, enum: ["Part Time", "Full Time"], default: "Full Time" },
  salaryPerDay: { type: Number, required: [true, "Salary Per Day is required"] },
  hoursNeeded: { type: Number, required: [true, "Hours Needed is required"] },
  description: { type: String, required: [true, "Description is required"] }
})

export default model<IJob>("Job", JobSchema)
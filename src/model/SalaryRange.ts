import { Document, Schema, ObjectId, model } from "mongoose"

export interface ISalaryRange extends Document {
  name: string,
  hourlyRate: Number,
  user: ObjectId
}

const SalaryRangeSchema: Schema = new Schema({
  name: {
    type: String,
    required: [true, "Salary Range is Required"],
    unique: [true, "Salary Range already exists"]
  },
  hourlyRate: {
    type: Number,
    required: [true, "Hourly Rate is required"]
  },
  user: {
    type: Schema.ObjectId,
    required: [true, "User is required"]
  }
}, { timestamps: true })

export default model<ISalaryRange>("Salary Range", SalaryRangeSchema)
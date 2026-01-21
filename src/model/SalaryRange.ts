import { Schema, ObjectId, model } from "mongoose"

export interface ISalaryRange {
  name: string,
  hourlyRate: Number,
  user: ObjectId
}

const SalaryRangeSchema = new Schema<ISalaryRange>({
  name: {
    type: String,
    required: [true, "Salary Range is Required"],
    unique: true
  },
  hourlyRate: {
    type: Number,
    required: true
  },
  user: {
    type: Schema.Types.ObjectId,
    required: true
  }
}, { timestamps: true })

export default model<ISalaryRange>("Salary Range", SalaryRangeSchema)
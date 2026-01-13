import { Document, Schema, model } from "mongoose"

export interface ISalaryRange extends Document {
  name: string
}

const SalaryRangeSchema: Schema = new Schema({
  name: {
    type: String,
    required: [true, "Salary Range is Required"],
    unique: [true, "Salary Range already exists"]
  }
})

export default model<ISalaryRange>("Salary Range", SalaryRangeSchema)
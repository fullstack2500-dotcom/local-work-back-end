import { Schema, ObjectId, model } from "mongoose";

export interface IExperience {
  title: string,
  noOfYears: Number,
  user: ObjectId
}

const ExperienceSchema = new Schema<IExperience>({
  title: { type: String, required: [true, "Experience title is required" ]},
  noOfYears: { type: Number },
  user: { type: Schema.Types.ObjectId, ref: 'User', required: [true, "User ID is required"] }
}, { timestamps: true })

export default model<IExperience>("Experience", ExperienceSchema)
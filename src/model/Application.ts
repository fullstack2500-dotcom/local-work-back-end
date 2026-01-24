import { Document, ObjectId, Schema, model } from "mongoose"

export interface IApplication extends Document {
  job: ObjectId,
  user: ObjectId, // The user ID of the job applicant worker
  subject: string,
  message: string,
  contact: string
}

const ApplicationSchema = new Schema<IApplication>({
  job: { type: String, required: [true, "Job is required"] },
  user: { type: String, required: [true, "User is required"] },
  subject: { type: String, required: [true, "Subject is needed"] },
  message: { type: String, required: [true, "Message is required"] },
  contact: { type: String, required: [true, "Contact details are needed"] }
}, { timestamps: true })

export default model<IApplication>("Application", ApplicationSchema)
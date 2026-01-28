import { Document, ObjectId, Schema, model } from "mongoose"

export interface IApplication extends Document {
  job: ObjectId,
  worker: ObjectId, // The user ID of the job applicant worker
  subject: string,
  message: string,
  contact: string
}

const ApplicationSchema = new Schema<IApplication>({
  job: { type: Schema.Types.ObjectId, ref: 'Job', required: [true, "Job is required"] },
  worker: { type: Schema.Types.ObjectId, ref: 'User', required: [true, "User is required"] },
  subject: { type: String, required: [true, "Subject is needed"] },
  message: { type: String, required: [true, "Message is required"] },
  contact: { type: String, required: [true, "Contact details are needed"] }
}, { timestamps: true })

export default model<IApplication>("Application", ApplicationSchema)
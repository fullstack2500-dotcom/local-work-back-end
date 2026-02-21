import { Document, ObjectId, Schema, model } from "mongoose"

export interface IApplication extends Document {
  job: string,
  worker: string,
  timeline: string,
  status: string
}

const ApplicationSchema = new Schema({
  job: { type: Schema.Types.ObjectId, ref: 'Job', required: [true, "Job is required"] },
  worker: { type: Schema.Types.ObjectId, ref: 'Worker', required: [true, "Worker is required"] },
  timeline: { type: String, enum: [ "Submitted", "Review", "Interview", "Final Decision" ], default: "Submitted" },
  status: { type: String, enum: [ "Pending Review", "Interview Scheduled", "Accepted", "Not Selected", "Withdrawed" ], default: "Pending Review" }
}, { timestamps: true })

export default model<IApplication>("Application", ApplicationSchema)
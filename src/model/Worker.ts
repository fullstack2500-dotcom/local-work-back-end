import { Document, Schema, ObjectId, model } from "mongoose";

export interface IWorker extends Document {
  user: ObjectId,
  phoneNumber: string,
  barangay: string,
  cityMunicipality: string,
  profile: string,
  status: string
}

const WorkerSchema: Schema = new Schema({
  user: { type: Schema.ObjectId, ref: 'User', required: [true, "User is required"] },
  phoneNumber: { type: String, required: [true, "Phone Number is required"] },
  barangay: { type: String, required: [true, "Barangay is required"] },
  cityMunicipality: { type: String, required: [true, "City/Municipality is required"] },
  profile: { type: String, default: "" },
  status: { type: String, enum: ["pending", "verified"], default: "pending" }
}, { timestamps: true })

export default model<IWorker>("Worker", WorkerSchema)
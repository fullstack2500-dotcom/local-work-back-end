import { Document, ObjectId, Schema, model } from "mongoose";

export interface IEmployer extends Document {
  user: ObjectId,
  category: ObjectId,
  location: ObjectId,
  rating: Number,
  status: string, // String for now
  aboutMe: string,
  skills: [],
  experience: [],
  portfolio: []
}

const EmployerSchema: Schema = new Schema({
  user: { type: Schema.ObjectId, required: [true, "User is required"] },
  category: { type: Schema.ObjectId, default: "" },
  location: { type: Schema.ObjectId, default: "" },
  rating: { type: Number, default: "N/A" },
  status: { type: String, enum: ["Available for work"], default: "Available for work" }, // Available for now
  aboutMe: { type: String },
  skills: { type: [] },
  experience: { type: [] },
  portfolio: { type: [] }
}, { timestamps: true })

export default model<IEmployer>("Employer", EmployerSchema)
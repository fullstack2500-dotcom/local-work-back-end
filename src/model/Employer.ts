import { Document, ObjectId, Schema, model } from "mongoose";

export interface IEmployer extends Document {
  name: string,
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
  name: { type: String, required: [true, "Name is required"], unique: [true, "Name is already in use"] },
  category: { type: Schema.ObjectId, default: "" },
  location: { type: Schema.ObjectId, default: "" },
  rating: { type: Number, default: "N/A" },
  status: { type: String, enum: ["Available for work"], default: "Available for work" }, // Available for now
  aboutMe: { type: String },
  skills: { type: [] },
  experience: { type: [] },
  portfolio: { type: [] }
})

export default model<IEmployer>("Employer", EmployerSchema)
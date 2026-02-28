import { Document, Schema, model } from "mongoose";

// Users:
// - First Name
// - Last Name
// - Email
// - Phone Number
// - Password
// - Profile
// - Resume / CV

export interface IWorker extends Document {
  name: string,
  email: string,
  password: string,
  phoneNumber: string,
  role: string,
  skills: string[],
  skillCategory: string,
  certifications: string[],
  photo: string,
  resume: string,
  jobTitle: string,
  location: string,
  yearsOfExperience: string,
  availability: string,
  expected_salary: string,
  about_me: string,
  jobs_applied: Number,
  interviews: Number,
  rating: Number,
  hourlyRate: Number,
  education: string,
  previousJobs: string,
  status: string
}

const WorkerSchema: Schema = new Schema({
  name: { type: String, required: [true, "First name is required"], unique: [true, "Name is already in use"] },
  email: { type: String, required: [true, "Email is required"], unique: [true, "Email is already in use"] },
  password: { type: String, required: [true, "Password is required"] },
  phoneNumber: { type: String, required: [true, "Phone Number is required"], default: "" },
  role: { type: String, enum: ["worker", "employer", "admin"], default: "worker" },
  skills: [ { type: String, required: [true, "Skill is required"]}],
  skillCategory: { type: Schema.Types.ObjectId, ref: 'Skill', required: [true, "Skill Category is Required"]},
  photo: { type: String, default: "" },
  resume: { type: String, default: "" },
  jobTitle: { type: String, default: "N/A" },
  location: { type: String, default: "No Specified Location" },
  yearsOfExperience: { type: String, default: "N/A" },
  availability: { type: String, enum: ["Full-Time", "Part-Time", "Contract", "Flexible"], default: "Full-Time" },
  expected_salary: { type: String, default: "N/A" },
  about_me: { type: String, default: "N/A" },
  jobs_applied: { type: Number, default: 0 },
  interviews: { type: Number, default: 0 },
  rating: { type: Number, default: 0 },
  hourlyRate: { type: String },
  education: { type: String },
  certifications: [
    { type: String }
  ],
  previousJobs: [
    { type: String }
  ],
  status: { type: String, default: "pending" }
}, { timestamps: true })

export default model<IWorker>("Worker", WorkerSchema)
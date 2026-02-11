import { Document, Schema, model } from "mongoose";

// Users:
// - First Name
// - Last Name
// - Email
// - Phone Number
// - Password
// - Profile
// - Resume / CV

export interface IUser extends Document {
  name: string,
  email: string,
  password: string,
  phoneNumber: string,
  role: string,
  skills: string[],
  files: {
    photo: string,
    resume: string
  }
  businessPermit: string,
  companyRegistration: string,
  jobTitle: string,
  location: string,
  yearsOfExperience: string,
  availability: string,
  expected_salary: string,
  about_me: string,
  jobs_applied: Number,
  interviews: Number
}

const UserSchema: Schema = new Schema({
  name: { type: String, required: [true, "First name is required"], unique: [true, "Name is already in use"] },
  email: { type: String, required: [true, "Email is required"], unique: [true, "Email is already in use"] },
  password: { type: String, required: [true, "Password is required"] },
  phoneNumber: { type: String, required: [true, "Phone Number is required"], default: "" },
  role: { type: String, enum: ["worker", "employer", "admin"], default: "worker" },
  skills: [
    { type: String }
  ],
  files: {
    photo: { type: String, default: "" },
    resume: { type: String, default: "" }
  },
  businessPermit: { type: String, default: "" },
  companyRegistration: { type: String, default: "" },
  jobTitle: { type: String, default: "N/A" },
  location: { type: String, default: "No Specified Location" },
  yearsOfExperience: { type: String, default: "N/A" },
  availability: { type: String, enum: ["Full-Time", "Part-Time", "Contract", "Flexible"], default: "Full-Time" },
  expected_salary: { type: String, default: "N/A" },
  about_me: { type: String, default: "N/A" },
  jobs_applied: { type: Number, default: 0 },
  interviews: { type: Number, default: 0 }
}, { timestamps: true })

export default model<IUser>("User", UserSchema)
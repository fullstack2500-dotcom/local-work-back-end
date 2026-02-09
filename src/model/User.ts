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
  skills: string,
  files: {
    photo: string,
    resume: string
  }
  businessPermit: string,
  companyRegistration: string
}

const UserSchema: Schema = new Schema({
  name: { type: String, required: [true, "First name is required"], unique: [true, "Name is already in use"] },
  email: { type: String, required: [true, "Email is required"], unique: [true, "Email is already in use"] },
  password: { type: String, required: [true, "Password is required"] },
  phoneNumber: { type: String, required: [true, "Phone Number is required"], default: "" },
  role: { type: String, enum: ["worker", "employer", "admin"], default: "worker" },
  skills: { type: String, required: [true, "Skills are required"] },
  files: {
    photo: { type: String, default: "" },
    resume: { type: String, default: "" }
  },
  businessPermit: { type: String, default: "" },
  companyRegistration: { type: String, default: "" }
}, { timestamps: true })

export default model<IUser>("User", UserSchema)
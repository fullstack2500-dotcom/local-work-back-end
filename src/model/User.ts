import { Document, Schema, model } from "mongoose";

export interface IUser extends Document {
  name: string,
  email: string,
  password: string,
  role: string,
  phoneNumber: string,
  barangay: string,
  cityMunicipality: string,
  profile: string,
  status: string
}

const UserSchema: Schema = new Schema({
  name: { type: String, required: [true, "Name is required"], unique: [true, "Name is already in use"] },
  email: { type: String, required: [true, "Email is required"], unique: [true, "Email is already in use"] },
  password: { type: String, required: [true, "Password is required"] },
  role: { type: String, enum: ["worker", "employer", "admin"], default: "worker" },
  phoneNumber: { type: String, required: [true, "Phone Number is required"] },
  barangay: { type: String, required: [true, "Barangay is required"] },
  cityMunicipality: { type: String, required: [true, "City/Municipality is required"] },
  profile: { type: String, default: "" },
  status: { type: String, enum: ["pending", "verified"], default: "pending" }
}, { timestamps: true })

export default model<IUser>("User", UserSchema)
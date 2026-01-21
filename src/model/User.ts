import { Schema, model } from "mongoose";

export interface IUser {
  name: string,
  email: string,
  password: string,
  role: "worker" | "employer" | "admin",
  supabaseId: string | null,
  phoneNumber: string | null,
  cityMunicipality: string | null,
  profile: string | null,
  status: "pending" | "verified"
}

const UserSchema = new Schema<IUser>({
  name: { type: String, required: [true, "Name is required"], unique: true },
  email: { type: String, required: [true, "Email is required"], unique: true },
  password: { type: String, required: [true, "Password is required"], select: false },
  role: { type: String, enum: ["worker", "employer", "admin"], default: "worker" },
  supabaseId: { type: String, default: null },
  phoneNumber: { type: String, default: null },
  cityMunicipality: { type: String, default: null },
  profile: { type: String, default: null },
  status: { type: String, enum: ["pending", "verified"], default: "pending" }
}, { timestamps: true })

export default model<IUser>("User", UserSchema)
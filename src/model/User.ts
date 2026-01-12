import { Document, Schema, model } from "mongoose";

export interface IUser extends Document {
  name: String,
  email: String,
  password: String,
  role: String
}

const UserSchema = new Schema({
  name: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ["user", "admin"], default: "user" }
}, { timestamps: true })

export default model<IUser>("User", UserSchema)
import { Schema, model } from "mongoose";

export interface IStatus {
  status: "Available for work"
}

const StatusSchema = new Schema<IStatus>({
  status: { type: String, enum: ["Available for work"], default: "Available for work" }, // Available for now
}, { timestamps: true })

export default model<IStatus>("Statu", StatusSchema)
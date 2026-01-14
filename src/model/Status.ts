import { Document, ObjectId, Schema, model } from "mongoose";

export interface IStatus extends Document {
  status: string
}

const StatusSchema: Schema = new Schema({
  status: { type: String, enum: ["Available for work"], default: "Available for work" }, // Available for now
}, { timestamps: true })

export default model<IStatus>("Statu", StatusSchema)
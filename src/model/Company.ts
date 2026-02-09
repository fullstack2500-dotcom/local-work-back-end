import { Document, Schema, ObjectId, model } from "mongoose";

export interface ICompany extends Document {
  title: string
}

const CompanySchema: Schema = new Schema({
  title: { type: String, required: [true, "Title is required"] }
}, { timestamps: true })

export default model("Companie", CompanySchema)
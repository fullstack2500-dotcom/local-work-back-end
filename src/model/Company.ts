import { Document, Schema, ObjectId, model } from "mongoose";

export interface ICompany extends Document {
  title: string,
  industry: string,
  location: string,
  description: string,
  noOfEmployees: Number,
  openPositions: Number,
  totalApplications: Number,
  website: string,
  companyOwner: string,
  logo: string
}

const CompanySchema: Schema = new Schema({
  title: { type: String, required: [true, "Title is required"] },
  industry: { type: Schema.Types.ObjectId, ref: 'Industry', required: [true, "Industry is required"] },
  location: { type: Schema.Types.ObjectId, ref: 'Location', required: [true, "Location is required"] },
  description: { type: String, required: [true, "Description is required"] },
  noOfEmployees: { type: Number, default: 0 },
  openPositions: { type: Number, default: 0 },
  totalApplications: { type: Number, default: 0 },
  website: { type: String, default: "N/A" },
  companyOwner: { type: Schema.Types.ObjectId, ref: 'CompanyOwner', required: [true, "Company Owner is required"]},
  logo: { type: String, default: "default.png" }
}, { timestamps: true })

export default model("Companie", CompanySchema)
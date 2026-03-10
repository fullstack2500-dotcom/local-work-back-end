import { Document, Schema, model } from "mongoose";

export interface ICompanyOwner extends Document {
  email: string,
  phone: string
}

const CompanyOwnerSchema: Schema = new Schema({
  email: { type: String, required: [true, "Email is required"] },
  phone: { type: String, required: [true, "Phone is required"] }
}, { timestamps: true })

export default model<ICompanyOwner>("CompanyOwner", CompanyOwnerSchema)
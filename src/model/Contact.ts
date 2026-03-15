import { Document, Schema, model } from "mongoose";

export interface IContactDetails extends Document {
  employer: string,
  title: string,
  description: string,
  worker: string
}

const ContactDetails: Schema = new Schema({
  employer: { type: Schema.Types.ObjectId, ref: 'Employer', required: [true, "Employer is required"] },
  title: { type: String, required: [true, "Title is required"] },
  description: { type: String, required: [true, "Description is required"] },
  worker: { type: Schema.Types.ObjectId, ref: 'Worker', required: [true, "Worker is required"] }
})

export default model<IContactDetails>("Contact", ContactDetails)
import { Document, Schema, ObjectId, model } from "mongoose";

export interface IPortfolio extends Document {
  title: string,
  imageURL: string,
  user: ObjectId
}

const PortfolioSchema: Schema = new Schema({
  title: { type: String, required: [true, "Title is required"] },
  imageURL: { type: String, required: [true, "Image is required"] },
  user: { type: Schema.ObjectId, ref: 'User', required: [true, "User ID is required"] }
})

export default model<IPortfolio>("Portfolio", PortfolioSchema)
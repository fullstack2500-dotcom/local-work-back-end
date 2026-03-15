import { Document, Schema, model } from "mongoose";

export interface IRating extends Document {
  rating: Number,
  worker: string,
  skill: string,
  description: string
}

const RatingSchema: Schema = new Schema({
  rating: { type: Number },
  worker: { type: Schema.Types.ObjectId, ref: 'Worker', required: [true, "Worker is required"] },
  skill: { type: Schema.Types.ObjectId, ref: 'Skill', required: [true, "Skill is Required"] },
  description: { type: String, required: [true, "Description is required"] }
})

export default model<IRating>("Rating", RatingSchema)
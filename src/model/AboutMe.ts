import { Schema, ObjectId, model } from "mongoose";

export interface IAboutMe {
  description: string,
  user: ObjectId
}

const AboutMeSchema = new Schema<IAboutMe>({
  description: { type: String, required: [true, "Description is required"] },
  user: { type: Schema.ObjectId, ref: 'User', required: [true, "User ID is required"] }
}, { timestamps: true })

export default model<IAboutMe>("AboutMe", AboutMeSchema)
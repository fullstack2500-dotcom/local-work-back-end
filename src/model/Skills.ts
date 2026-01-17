import { Document, ObjectId, Schema, model } from "mongoose";

export interface ISkill extends Document {
  title: string,
  fileURL: string,
  user: ObjectId
}

const SkillSchema: Schema = new Schema({
  title: { type: String, required: [true, "Skill is required"] },
  fileURL: { type: String, required: [true, "File URL is required"]},
  user: { type: Schema.ObjectId, ref: 'User', required: [true, "User ID is required"] }
}, { timestamps: true })

export default model<ISkill>("Skill", SkillSchema)
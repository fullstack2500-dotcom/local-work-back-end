import { Document, ObjectId, Schema, model } from "mongoose";

export interface ISkill extends Document {
  title: string,
  fileURL: string,
}

const SkillSchema: Schema = new Schema({
  title: { type: String, required: [true, "Skill is required"] },
  fileURL: { type: String, required: [true, "File URL is required"]}
}, { timestamps: true })

export default model<ISkill>("Skill", SkillSchema)
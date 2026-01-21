import { Schema, model } from "mongoose";

export interface ISkill {
  title: string,
  fileURL: string,
}

const SkillSchema = new Schema<ISkill>({
  title: { type: String, required: [true, "Skill is required"] },
  fileURL: { type: String, required: [true, "File URL is required"]}
}, { timestamps: true })

export default model<ISkill>("Skill", SkillSchema)
import { Document, Schema, ObjectId, model } from "mongoose";

export interface ISkill extends Document {
  title: string,
  job: string
}

const SkillSchema: Schema = new Schema({
  title: { type: String, required: [true, "Skill is required"] },
  job: { type: Schema.Types.ObjectId, ref: 'Job', required: [true, "Job is required"] }
}, { timestamps: true })

export default model<ISkill>("Skill", SkillSchema)
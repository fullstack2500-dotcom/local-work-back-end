import { Document, ObjectId, Schema, model } from "mongoose";

export interface ISkill extends Document {
  title: string,
  user: ObjectId
}

export const SkillSchema: Schema = new Schema({
  title: { type: String },
  user: { type: Schema.ObjectId }
}, { timestamps: true })

export default model<ISkill>("Skill", SkillSchema)
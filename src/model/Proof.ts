import { Schema, ObjectId, model } from "mongoose";

export interface IProof {
  document: string,
  worker: ObjectId
}

const ProofSchema = new Schema<IProof>({
  document: { type: String, default: "" },
  worker: { type: Schema.ObjectId, required: [true, "Worker ID is required"] }
})

export default model<IProof>("Proof", ProofSchema)
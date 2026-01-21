import { Schema, ObjectId, model } from "mongoose";

export interface IProof {
  document: string | null,
  worker: ObjectId
}

const ProofSchema = new Schema<IProof>({
  document: { type: String, default: null },
  worker: { type: Schema.Types.ObjectId, required: [true, "Worker ID is required"] }
})

export default model<IProof>("Proof", ProofSchema)
import { Schema, ObjectId, model } from "mongoose";

export interface IBarangay {
  user: ObjectId,
  name: string
}

const BarangaySchema = new Schema<IBarangay>({
  user: { type: Schema.Types.ObjectId, required: [true, "User ID is Required"] },
  name: { type: String, required: [true, "Barangay Name is required"] }
}, { timestamps: true })

export default model<IBarangay>("Barangay", BarangaySchema)
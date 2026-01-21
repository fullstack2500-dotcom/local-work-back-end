import { Schema, model } from "mongoose"

export interface ILocation {
  name: string
}

const LocationSchema = new Schema<ILocation>({
  name: {
    type: String,
    required: [true, "Location is required"],
    unique: [true, "Location already exists"]
  }
}, { timestamps: true })

export default model<ILocation>("Location", LocationSchema)
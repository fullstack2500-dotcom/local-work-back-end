import { Document, Schema, model } from "mongoose";

export interface ICategory extends Document {
  name: string
}

const CategorySchema: Schema = new Schema({
  name: { type: String, required: [true, "Category is required"], unique: [true, "Category already in use"] }
}, { timestamps: true })

const Category = model<ICategory>("Categorie", CategorySchema)

export default Category
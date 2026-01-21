import { Schema, model } from "mongoose";

export interface ICategory {
  name: string
}

const CategorySchema = new Schema<ICategory>({
  name: { type: String, required: [true, "Category is required"], unique: true }
}, { timestamps: true })

const Category = model<ICategory>("Categorie", CategorySchema)

export default Category
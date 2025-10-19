import { model, Schema } from 'mongoose';
import { ICategory } from './category.interface';

const CategorySchema: Schema = new Schema<ICategory>(
    {
        title: { type: String, required: true },
        images: { type: String }, // optional
        isDeleted: { type: Boolean, default: false },
    },
    {
        timestamps: true,
    }
);

const CategoryModel = model<ICategory>('Category', CategorySchema);

export default CategoryModel;

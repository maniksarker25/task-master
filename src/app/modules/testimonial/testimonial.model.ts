import { model, Schema } from 'mongoose';
import { ITestimonial } from './testimonial.interface';

const testimonialSchema = new Schema<ITestimonial>(
    {
        customer: {
            type: Schema.Types.ObjectId,
            ref: 'Customer',
            required: true,
        },
        details: {
            type: String,
            required: true,
        },
        rating: {
            type: String,
            required: true,
        },
    },
    { timestamps: true }
);

const testimonialModel = model<ITestimonial>('Testimonial', testimonialSchema);
export default testimonialModel;

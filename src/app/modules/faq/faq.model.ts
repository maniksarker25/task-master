import { model, Schema } from 'mongoose';
import { IFaq } from './faq.interface';

const faqSchema = new Schema<IFaq>(
    {
        question: { type: String, required: true },
        answer: { type: String, required: true },
    },
    { timestamps: true }
);

const faqModel = model<IFaq>('Faq', faqSchema);
export default faqModel;

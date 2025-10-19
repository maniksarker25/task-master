import { model, Schema } from 'mongoose';
import { IQuestion } from './question.interface';

const questionSchema = new Schema<IQuestion>(
    {
        provider: {
            type: Schema.Types.ObjectId,
            ref: 'Provider',
            required: true,
        },
        task: {
            type: Schema.Types.ObjectId,
            ref: 'Task',
            required: true,
        },
        details: {
            type: String,
            required: true,
        },
        images: {
            type: String, // optional
        },
        questionTime: {
            type: Date,
            required: true,
        },
    },
    { timestamps: true }
);

const questionModel = model<IQuestion>('Question', questionSchema);
export default questionModel;

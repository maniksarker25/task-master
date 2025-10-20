import { model, Schema } from 'mongoose';
import { IPayment } from './payment.interface';
import { ENUM_PAYMENT_STATUS } from './payment.enum';

const paymentSchema = new Schema<IPayment>(
    {
        provider: {
            type: Schema.Types.ObjectId,
            ref: 'Provider',
            required: true,
        },
        email: {
            type: String,
            required: true,
            trim: true,
        },
        amount: {
            type: Number,
            required: true,
        },
        bankName: {
            type: String,
            required: true,
        },
        acNumber: {
            type: String,
            required: true,
        },
        completeDate: {
            type: Date,
            required: true,
        },
        status: {
            type: String,
            enum: Object.values(ENUM_PAYMENT_STATUS),
            default: ENUM_PAYMENT_STATUS.PENDING,
        },
    },
    { timestamps: true }
);

const paymentModel = model<IPayment>('Payment', paymentSchema);
export default paymentModel;

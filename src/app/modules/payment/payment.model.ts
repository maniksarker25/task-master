import { model, Schema } from 'mongoose';
import { ENUM_PAYMENT_STATUS } from '../../utilities/enum';
import { IPayment } from './payment.interface';

const paymentSchema = new Schema<IPayment>(
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
        amount: {
            type: Number,
            required: true,
        },
        status: {
            type: String,
            enum: Object.values(ENUM_PAYMENT_STATUS),
            default: ENUM_PAYMENT_STATUS.UNPAID,
        },
    },
    { timestamps: true }
);

const Payment = model<IPayment>('Payment', paymentSchema);
export default Payment;

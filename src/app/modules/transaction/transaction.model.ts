import { model, Schema } from 'mongoose';
import { ITransaction } from './transaction.interface';

const transactionSchema = new Schema<ITransaction>(
    {
        amount: {
            type: Number,
            required: true,
        },
        type: {
            type: String,
            enum: ['credit', 'debit'],
            required: true,
        },
        transactionID: {
            type: String,
            required: true,
            unique: true,
        },
        reason: {
            type: String,
            enum: ['bitAccept', 'withdraw', 'order'],
            required: true,
        },
        user: {
            type: Schema.Types.ObjectId,
            refPath: 'userType',
            required: true,
        },
        userType: {
            type: String,
            required: true,
            enum: ['Customer', 'Provider'],
        },
    },
    { timestamps: true }
);

const transactionModel = model<ITransaction>('Transaction', transactionSchema);
export default transactionModel;

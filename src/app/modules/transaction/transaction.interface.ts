import { Types } from 'mongoose';

export interface ITransaction {
    amount: number;
    type: 'credit' | 'debit';
    transactionID: string;
    reason: 'bitAccept' | 'withdraw' | 'order';
    user: Types.ObjectId;
    userType: 'Customer' | 'Provider';
}

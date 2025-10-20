import { Types } from 'mongoose';
import { ENUM_PAYMENT_STATUS } from './payment.enum';

export interface IPayment {
    provider: Types.ObjectId; // ref -> Provider
    email: string;
    amount: number;
    bankName: string;
    acNumber: string;
    completeDate: Date;
    status: (typeof ENUM_PAYMENT_STATUS)[keyof typeof ENUM_PAYMENT_STATUS];
}

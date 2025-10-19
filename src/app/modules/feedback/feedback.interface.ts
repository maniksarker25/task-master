import { Types } from 'mongoose';

export interface IFeedback {
    task: Types.ObjectId; // ref -> Task
    provider: Types.ObjectId; // ref -> Provider
    customer: Types.ObjectId; // ref -> Customer
    rating: number;
    details: string;
}

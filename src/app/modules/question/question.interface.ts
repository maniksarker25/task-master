import { Types } from 'mongoose';

export interface IQuestion {
    provider: Types.ObjectId; // ref -> Provider
    task: Types.ObjectId; // ref -> Task
    details: string;
    images?: string; // optional single image or image URL
    questionTime: Date;
}

import { Types } from 'mongoose';
import {
    ENUM_DONE_BY,
    ENUM_PAYMENT_STATUS,
    ENUM_SCHEDULE_TYPE,
    ENUM_TASK_STATUS,
} from './task.enum';

export interface ITask {
    title: string;
    category: Types.ObjectId; // ref -> ServiceCategory
    budget: number;
    status: (typeof ENUM_TASK_STATUS)[keyof typeof ENUM_TASK_STATUS];
    isDeleted: boolean;
    paymentStatus: (typeof ENUM_PAYMENT_STATUS)[keyof typeof ENUM_PAYMENT_STATUS];
    provider?: Types.ObjectId; // ref -> Provider (optional until assigned)
    customer: Types.ObjectId; // ref -> Customer
    payOn: string;
    doneBy: (typeof ENUM_DONE_BY)[keyof typeof ENUM_DONE_BY];
    location: {
        type: 'Point';
        coordinates: [number, number];
    };
    scheduleType: (typeof ENUM_SCHEDULE_TYPE)[keyof typeof ENUM_SCHEDULE_TYPE];
    preferredDate?: Date;
    preferredTime?: string; // or `Date` if you store full datetime
    deception: string;
    task_attachments?: string[]; // images file
}

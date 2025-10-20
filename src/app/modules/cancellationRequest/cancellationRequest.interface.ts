import { Types } from 'mongoose';
import { ENUM_CANCELLATION_REQUEST_STATUS } from './cancellationRequest.enum';

export interface ICancellationRequest {
    task: Types.ObjectId; // ref -> Task
    requestedBy: Types.ObjectId; // ref -> Users
    requestedAt: Date;
    reason: string;
    description: string;
    evidence?: string;
    status: (typeof ENUM_CANCELLATION_REQUEST_STATUS)[keyof typeof ENUM_CANCELLATION_REQUEST_STATUS];
    rejectDetails?: string;
    reject_evidence?: string;
    reviewedRequestAt?: Date;
}

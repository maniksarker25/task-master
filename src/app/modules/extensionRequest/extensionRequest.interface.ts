import { Types } from 'mongoose';
import { ENUM_EXTENSION_REQUEST_STATUS } from './extensionRequest.enum';

export interface IExtensionRequest {
    task: Types.ObjectId; // ref -> Task
    requestedBy: Types.ObjectId; // ref -> Users
    requestedByModel: 'Customer' | 'Provider';
    currentDate: Date;
    requestedDate: Date;
    requestedAt: Date;
    reason: string;
    status: (typeof ENUM_EXTENSION_REQUEST_STATUS)[keyof typeof ENUM_EXTENSION_REQUEST_STATUS];
    rejectDetails?: string;
    reject_evidence: string; // ref -> RejectReason
    reviewedRequestAt?: Date;
}

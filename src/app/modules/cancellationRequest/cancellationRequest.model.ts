import { model, Schema } from 'mongoose';
import { ICancellationRequest } from './cancellationRequest.interface';
import { ENUM_CANCELLATION_REQUEST_STATUS } from './cancellationRequest.enum';

const cancellationRequestSchema = new Schema<ICancellationRequest>(
    {
        task: {
            type: Schema.Types.ObjectId,
            ref: 'Task',
            required: true,
        },
        requestedBy: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        requestedAt: {
            type: Date,
            required: true,
        },
        reason: {
            type: String,
            required: true,
        },
        description: {
            type: String,
            required: true,
        },
        evidence: {
            type: String,
        },
        status: {
            type: String,
            enum: Object.values(ENUM_CANCELLATION_REQUEST_STATUS),
            default: ENUM_CANCELLATION_REQUEST_STATUS.PENDING,
        },
        rejectDetails: {
            type: String,
        },
        rejectEvidence: {
            type: String,
        },
        reviewedRequestAt: {
            type: Date,
        },
    },
    { timestamps: true }
);

const cancellationRequestModel = model<ICancellationRequest>(
    'CancellationRequest',
    cancellationRequestSchema
);
export default cancellationRequestModel;

import { model, Schema } from 'mongoose';
import { IExtensionRequest } from './extensionRequest.interface';
import { ENUM_EXTENSION_REQUEST_STATUS } from './extensionRequest.enum';

const extensionRequestSchema = new Schema<IExtensionRequest>(
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
        currentDate: {
            type: Date,
            required: true,
        },
        requestedDate: {
            type: Date,
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
        status: {
            type: String,
            enum: Object.values(ENUM_EXTENSION_REQUEST_STATUS),
            default: ENUM_EXTENSION_REQUEST_STATUS.PENDING,
        },
        rejectDetails: { type: String },
        rejectEvidence: { type: String },

        reviewedRequestAt: {
            type: Date,
        },
    },
    { timestamps: true }
);

const extensionRequestModel = model<IExtensionRequest>(
    'ExtensionRequest',
    extensionRequestSchema
);
export default extensionRequestModel;

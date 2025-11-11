import { model, Schema } from 'mongoose';
import { ENUM_EXTENSION_REQUEST_STATUS } from './extensionRequest.enum';
import { IExtensionRequest } from './extensionRequest.interface';

const extensionRequestSchema = new Schema<IExtensionRequest>(
    {
        task: {
            type: Schema.Types.ObjectId,
            ref: 'Task',
            required: true,
        },
        requestedBy: {
            type: Schema.Types.ObjectId,
            required: true,
            refPath: 'requestedByModel',
        },
        requestedByModel: {
            type: String,
            required: true,
            enum: ['Customer', 'Provider'],
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
        reject_evidence: { type: String },

        reviewedRequestAt: {
            type: Date,
        },
    },
    { timestamps: true }
);

const ExtensionRequestModel = model<IExtensionRequest>(
    'ExtensionRequest',
    extensionRequestSchema
);
export default ExtensionRequestModel;

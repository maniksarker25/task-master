import { model, Schema } from 'mongoose';
import { IService } from './service.interface';
import { ENUM_SERVICE_STATUS } from './service.enum';

const serviceSchema = new Schema<IService>(
    {
        serviceCategory: {
            type: Schema.Types.ObjectId,
            ref: 'Category',
            required: true,
        },
        title: { type: String, required: true },
        images: [{ type: String }],

        provider: {
            type: Schema.Types.ObjectId,
            ref: 'Provider',
            required: true,
        },

        description: { type: String, required: true },
        experience: { type: String, required: true },
        onSiteSupport: { type: Boolean, default: false },
        toolsProvided: { type: Boolean, default: false },
        priceRange: { type: String, required: true },

        status: {
            type: String,
            enum: Object.values(ENUM_SERVICE_STATUS),
            default: ENUM_SERVICE_STATUS.ACTIVE,
        },
    },
    { timestamps: true }
);

const serviceModel = model<IService>('Service', serviceSchema);
export default serviceModel;

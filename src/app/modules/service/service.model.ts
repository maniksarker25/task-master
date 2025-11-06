import { model, Schema } from 'mongoose';
import { ENUM_SERVICE_STATUS } from './service.enum';
import { IService } from './service.interface';

const serviceSchema = new Schema<IService>(
    {
        category: {
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
        location: {
            type: {
                type: String,
                enum: ['Point'],
                required: true,
                default: 'Point',
            },
            coordinates: { type: [Number], required: true, index: '2dsphere' },
        },
        address: {
            type: String,
        },
        city: {
            type: String,
        },
        availability: { type: String, required: true },
        experience: { type: String, required: true },
        onSiteSupport: { type: Boolean, default: true },
        toolsProvided: { type: Boolean, default: true },
        languages: [{ type: String, required: true }],
        price: { type: Number, required: true },

        status: {
            type: String,
            enum: Object.values(ENUM_SERVICE_STATUS),
            default: ENUM_SERVICE_STATUS.ACTIVE,
        },
    },
    { timestamps: true }
);

const ServiceModel = model<IService>('Service', serviceSchema);
export default ServiceModel;

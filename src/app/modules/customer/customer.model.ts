import { model, Schema } from 'mongoose';
import { ICustomer } from './customer.interface';
import { ENUM_IDENTIFICATION_DOCUMENT } from './customer.enum';

const CustomerSchema = new Schema<ICustomer>(
    {
        user: { type: Schema.Types.ObjectId, ref: 'User', required: true },

        fullName: { type: String, required: true },
        email: { type: String, required: true },
        number: { type: String, required: true },
        image: { type: String },
        city: { type: String, required: true },
        street: { type: String, required: true },
        addressDocument: { type: String },

        identiDocument: {
            type: String,
            enum: Object.values(ENUM_IDENTIFICATION_DOCUMENT),
            required: true,
        },

        identiNumber: { type: String, required: true },
        identiDocumentImage: { type: String },

        bvn: { type: String },
        isVerified: { type: Boolean, default: false },
    },
    {
        timestamps: true,
    }
);
const CustomerModel = model<ICustomer>('Customer', CustomerSchema);

export default CustomerModel;

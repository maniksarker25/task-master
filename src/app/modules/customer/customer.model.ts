import { model, Schema } from 'mongoose';
import { ICustomer } from './customer.interface';

const CustomerSchema = new Schema<ICustomer>(
    {
        user: {
            type: Schema.Types.ObjectId,
            required: true,
            ref: 'User',
        },
        firstName: {
            type: String,
            required: true,
        },
        lastName: {
            type: String,
            // required: true,
            default: '',
        },
        email: {
            type: String,
            // required: true,
            // unique: true,
            default: '',
        },
        profile_image: {
            type: String,
            default: '',
        },
    },
    {
        timestamps: true,
    }
);
const Customer = model<ICustomer>('Customer', CustomerSchema);

export default Customer;

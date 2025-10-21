import { Schema, model } from 'mongoose';
import { ICustomer } from './customer.interface';

const customerSchema = new Schema<ICustomer>(
    {
        user: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        name: {
            type: String,
            required: true,
            trim: true,
        },
        email: {
            type: String,
            required: true,
            lowercase: true,
            trim: true,
            unique: true,
        },
        phone: {
            type: String,
            required: true,
            trim: true,
            unique: true,
        },
        profile_image: {
            type: String,
        },
        city: {
            type: String,
        },
        street: {
            type: String,
        },
        address_document: {
            type: String,
        },
    },
    {
        timestamps: true,
        versionKey: false,
    }
);

export const Customer = model<ICustomer>('Customer', customerSchema);

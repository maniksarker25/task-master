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
            default: '',
        },
        city: {
            type: String,
            default: '',
        },
        street: {
            type: String,
            default: '',
        },
        address: {
            type: String,
            default: '',
        },
        address_document: {
            type: String,
            default: '',
        },
        isAddressProvided: {
            type: Boolean,
            default: false,
        },
        bankAccountNumber: {
            type: String,
            default: '',
        },
        bankName: {
            type: String,
            default: '',
        },
        referralCode: {
            type: String,
            default: Math.random().toString(36).substring(2, 7).toUpperCase(),
            unique: true,
        },
    },
    {
        timestamps: true,
        versionKey: false,
    }
);

export const Customer = model<ICustomer>('Customer', customerSchema);

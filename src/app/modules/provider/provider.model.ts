import { Schema, model } from 'mongoose';
import { IProvider } from './provider.interface';

const providerSchema = new Schema<IProvider>(
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
        phone: {
            type: String,
            required: true,
            trim: true,
        },
        email: {
            type: String,
            required: true,
            lowercase: true,
            trim: true,
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
            default: '',
        },
        identificationDocumentType: {
            type: String,
        },
        identificationDocumentNumber: {
            type: String,
        },
        identification_document: {
            type: String,
        },
        bankVerificationNumber: {
            type: String,
        },
        isVerified: {
            type: Boolean,
            default: false,
        },
        isBankVerificationNumberApproved: {
            type: Boolean,
            default: false,
        },
        isIdentificationDocumentApproved: {
            type: Boolean,
            default: false,
        },
        isAddressProvided: {
            type: String,
            default: false,
        },
        bankAccountNumber: {
            type: String,
        },
        bankName: {
            type: String,
        },
    },
    {
        timestamps: true,
        versionKey: false,
    }
);

export const Provider = model<IProvider>('Provider', providerSchema);

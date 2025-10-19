import { Types } from 'mongoose';

export interface IProvider {
    user: Types.ObjectId;
    name: string;
    phone: string;
    email: string;
    profile_image?: string;
    city?: string;
    street?: string;
    address_document?: string;
    identificationDocumentType?: string;
    identificationDocumentNumber?: string;
    identification_document?: string;
    bankVerificationNumber?: string;
    isVerified?: boolean;
}

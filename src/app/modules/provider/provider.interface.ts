import { Types } from 'mongoose';
import { ENUM_IDENTIFICATION_DOCUMENT } from '../customer/customer.enum';

export interface IProvider {
    user: Types.ObjectId; // ref -> Users
    name: string;
    email: string;
    number: string;
    profile_image?: string;
    city: string;
    street: string;
    addressDocument?: string;
    identiDocument: (typeof ENUM_IDENTIFICATION_DOCUMENT)[keyof typeof ENUM_IDENTIFICATION_DOCUMENT];
    identiNumber: string;
    identiDocumentImage?: string;
    bvn?: string;
    isVerified: boolean;
    isDeleted: boolean;
}

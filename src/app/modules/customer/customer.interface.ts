import { Types } from 'mongoose';
import { ENUM_IDENTIFICATION_DOCUMENT } from './customer.enum';

export interface ICustomer {
    user: Types.ObjectId; // ref -> Users
    fullName: string;
    email: string;
    number: string;
    image?: string;
    city: string;
    street: string;
    addressDocument?: string;
    identiDocument: (typeof ENUM_IDENTIFICATION_DOCUMENT)[keyof typeof ENUM_IDENTIFICATION_DOCUMENT];
    identiNumber: string;
    identiDocumentImage?: string;
    bvn?: string;
    isVerified: boolean;
}

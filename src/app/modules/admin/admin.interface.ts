import { Types } from 'mongoose';

export interface IAdmin {
    _id: string;
    user: Types.ObjectId;
    name: string;
    email: string;
    phone: string;
    profile_image: string;
    status: 'active' | 'inactive';
}

import { Types } from 'mongoose';
import { ENUM_SERVICE_STATUS } from './service.enum';

export interface IService {
    category: Types.ObjectId;
    title: string;
    images?: string[];
    provider: Types.ObjectId;
    description: string;
    location: string;
    availability: string;
    experience: string;
    onSiteSupport: boolean;
    toolsProvided: boolean;
    languages: string[];
    price: number;
    status: (typeof ENUM_SERVICE_STATUS)[keyof typeof ENUM_SERVICE_STATUS];
}

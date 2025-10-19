import { Types } from 'mongoose';
import { ENUM_SERVICE_STATUS } from './service.enum';

export interface IService {
    serviceCategory: Types.ObjectId; // ref -> ServiceCategory
    title: string;
    images?: string[];
    provider: Types.ObjectId; // ref -> Provider
    description: string;
    experience: string;
    onSiteSupport: boolean;
    toolsProvided: boolean;
    priceRange: string;
    status: (typeof ENUM_SERVICE_STATUS)[keyof typeof ENUM_SERVICE_STATUS];
}

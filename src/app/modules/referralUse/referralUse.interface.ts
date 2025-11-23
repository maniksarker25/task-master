import { Types } from 'mongoose';
import { ENUM_REFERRAL_USE_STATUS } from './referralUse.enum';

export interface IReferralUse {
    referrer: Types.ObjectId; // ref -> User
    referred: Types.ObjectId; // ref -> User
    referrerFromModel: 'Customer' | 'Provider';
    referredFromModel: 'Customer' | 'Provider';
    status: (typeof ENUM_REFERRAL_USE_STATUS)[keyof typeof ENUM_REFERRAL_USE_STATUS];
    referral: Types.ObjectId; // ref -> Referral
}

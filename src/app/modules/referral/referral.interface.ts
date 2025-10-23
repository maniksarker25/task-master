import { ENUM_REFERRAL_FOR, ENUM_REFERRAL_STATUS } from './referral.enum';

export interface IReferral {
    value: number;
    referelFor: (typeof ENUM_REFERRAL_FOR)[keyof typeof ENUM_REFERRAL_FOR];
    status: (typeof ENUM_REFERRAL_STATUS)[keyof typeof ENUM_REFERRAL_STATUS];
}

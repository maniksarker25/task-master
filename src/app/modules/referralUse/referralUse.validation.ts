import { z } from 'zod';
import { ENUM_REFERRAL_USE_STATUS } from './referralUse.enum';

// ✅ Create Referral Use Zod Schema
export const createReferralUseZodSchema = z.object({
    body: z.object({
        referrer: z.string({ required_error: 'Referrer ID is required' }),
        referred: z.string({ required_error: 'Referred ID is required' }),
        status: z.nativeEnum(ENUM_REFERRAL_USE_STATUS).optional(),
        referral: z.string({ required_error: 'Referral ID is required' }),
    }),
});

// ✅ Update Referral Use Zod Schema
export const updateReferralUseZodSchema = z.object({
    body: z.object({
        referrer: z.string().optional(),
        referred: z.string().optional(),
        status: z.nativeEnum(ENUM_REFERRAL_USE_STATUS).optional(),
        referral: z.string().optional(),
    }),
});

const ReferralUseValidations = {
    createReferralUseZodSchema,
    updateReferralUseZodSchema,
};

export default ReferralUseValidations;

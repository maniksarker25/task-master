import { z } from "zod";

export const updateReferralUseData = z.object({
    body: z.object({
        name: z.string().optional(),
        phone: z.string().optional(),
        address: z.string().optional(),
    }),
});

const ReferralUseValidations = { updateReferralUseData };
export default ReferralUseValidations;
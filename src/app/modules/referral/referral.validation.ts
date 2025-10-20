import { z } from "zod";

export const updateReferralData = z.object({
    body: z.object({
        name: z.string().optional(),
        phone: z.string().optional(),
        address: z.string().optional(),
    }),
});

const ReferralValidations = { updateReferralData };
export default ReferralValidations;
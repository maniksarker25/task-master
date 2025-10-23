import { z } from "zod";

export const updatePromoUseData = z.object({
    body: z.object({
        name: z.string().optional(),
        phone: z.string().optional(),
        address: z.string().optional(),
    }),
});

const PromoUseValidations = { updatePromoUseData };
export default PromoUseValidations;
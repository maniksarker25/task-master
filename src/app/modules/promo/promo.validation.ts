import { z } from "zod";

export const updatePromoData = z.object({
    body: z.object({
        name: z.string().optional(),
        phone: z.string().optional(),
        address: z.string().optional(),
    }),
});

const PromoValidations = { updatePromoData };
export default PromoValidations;
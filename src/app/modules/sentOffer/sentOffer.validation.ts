import { z } from "zod";

export const updateSentOfferData = z.object({
    body: z.object({
        name: z.string().optional(),
        phone: z.string().optional(),
        address: z.string().optional(),
    }),
});

const SentOfferValidations = { updateSentOfferData };
export default SentOfferValidations;
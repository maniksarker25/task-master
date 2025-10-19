import { z } from "zod";

export const updateSubscriberData = z.object({
    body: z.object({
        name: z.string().optional(),
        phone: z.string().optional(),
        address: z.string().optional(),
    }),
});

const SubscriberValidations = { updateSubscriberData };
export default SubscriberValidations;
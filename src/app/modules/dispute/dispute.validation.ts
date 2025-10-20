import { z } from "zod";

export const updateDisputeData = z.object({
    body: z.object({
        name: z.string().optional(),
        phone: z.string().optional(),
        address: z.string().optional(),
    }),
});

const DisputeValidations = { updateDisputeData };
export default DisputeValidations;
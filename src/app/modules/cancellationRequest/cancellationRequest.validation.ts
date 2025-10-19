import { z } from "zod";

export const updateCancellationRequestData = z.object({
    body: z.object({
        name: z.string().optional(),
        phone: z.string().optional(),
        address: z.string().optional(),
    }),
});

const CancellationRequestValidations = { updateCancellationRequestData };
export default CancellationRequestValidations;
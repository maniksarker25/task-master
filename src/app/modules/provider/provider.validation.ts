import { z } from "zod";

export const updateProviderData = z.object({
    body: z.object({
        name: z.string().optional(),
        phone: z.string().optional(),
        address: z.string().optional(),
    }),
});

const ProviderValidations = { updateProviderData };
export default ProviderValidations;
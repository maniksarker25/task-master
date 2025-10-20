import { z } from "zod";

export const updateExtensionRequestData = z.object({
    body: z.object({
        name: z.string().optional(),
        phone: z.string().optional(),
        address: z.string().optional(),
    }),
});

const ExtensionRequestValidations = { updateExtensionRequestData };
export default ExtensionRequestValidations;
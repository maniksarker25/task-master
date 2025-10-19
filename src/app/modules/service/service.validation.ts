import { z } from "zod";

export const updateServiceData = z.object({
    body: z.object({
        name: z.string().optional(),
        phone: z.string().optional(),
        address: z.string().optional(),
    }),
});

const ServiceValidations = { updateServiceData };
export default ServiceValidations;
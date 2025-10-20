import { z } from "zod";

export const updateTestimonialData = z.object({
    body: z.object({
        name: z.string().optional(),
        phone: z.string().optional(),
        address: z.string().optional(),
    }),
});

const TestimonialValidations = { updateTestimonialData };
export default TestimonialValidations;
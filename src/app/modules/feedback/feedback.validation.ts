import { z } from "zod";

export const updateFeedbackData = z.object({
    body: z.object({
        name: z.string().optional(),
        phone: z.string().optional(),
        address: z.string().optional(),
    }),
});

const FeedbackValidations = { updateFeedbackData };
export default FeedbackValidations;
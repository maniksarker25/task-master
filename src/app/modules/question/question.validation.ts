import { z } from "zod";

export const updateQuestionData = z.object({
    body: z.object({
        name: z.string().optional(),
        phone: z.string().optional(),
        address: z.string().optional(),
    }),
});

const QuestionValidations = { updateQuestionData };
export default QuestionValidations;
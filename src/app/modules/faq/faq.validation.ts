import { z } from 'zod';

const createFaq = z.object({
    body: z.object({
        question: z.string({
            required_error: 'Question is required',
        }),
        answer: z.string({
            required_error: 'Answer is required',
        }),
    }),
});

const updateFaq = z.object({
    body: z.object({
        question: z.string().optional(),
        answer: z.string().optional(),
    }),
});

const FaqValidations = { createFaq, updateFaq };
export default FaqValidations;

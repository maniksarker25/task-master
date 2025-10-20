import { z } from 'zod';

// ✅ Create Question Zod Schema
export const createQuestionZodSchema = z.object({
    body: z.object({
        provider: z.string({ required_error: 'Provider ID is required' }),
        task: z.string({ required_error: 'Task ID is required' }),
        details: z
            .string({ required_error: 'Details are required' })
            .min(1, 'Details cannot be empty'),
        images: z.string().optional(),
        questionTime: z.coerce.date({
            required_error: 'Question time is required',
        }),
    }),
});

// ✅ Update Question Zod Schema
export const updateQuestionZodSchema = z.object({
    body: z.object({
        provider: z.string().optional(),
        task: z.string().optional(),
        details: z.string().min(1, 'Details cannot be empty').optional(),
        images: z.string().optional(),
        questionTime: z.coerce.date().optional(),
    }),
});

const QuestionValidations = {
    createQuestionZodSchema,
    updateQuestionZodSchema,
};

export default QuestionValidations;

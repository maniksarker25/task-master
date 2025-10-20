import { z } from 'zod';

// ✅ Create Bid Zod Schema
export const createBidZodSchema = z.object({
    body: z.object({
        provider: z.string({ required_error: 'Provider ID is required' }),
        task: z.string({ required_error: 'Task ID is required' }),
        price: z
            .number({ required_error: 'Price is required' })
            .positive('Price must be positive'),
        details: z
            .string({ required_error: 'Details are required' })
            .min(1, 'Details cannot be empty'),
        time: z.coerce.date({ required_error: 'Time is required' }),
    }),
});

// ✅ Update Bid Zod Schema
export const updateBidZodSchema = z.object({
    body: z.object({
        provider: z.string().optional(),
        task: z.string().optional(),
        price: z.number().positive().optional(),
        details: z.string().min(1, 'Details cannot be empty').optional(),
        time: z.coerce.date().optional(),
    }),
});

const BidValidations = { createBidZodSchema, updateBidZodSchema };
export default BidValidations;

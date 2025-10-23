import { z } from 'zod';

// ✅ Create PromoUse Zod Schema
export const createPromoUseZodSchema = z.object({
    body: z.object({
        promo: z.string({ required_error: 'Promo ID is required' }),
        customer: z.string({ required_error: 'Customer ID is required' }),
        task: z.string().optional(),
        service: z.string().optional(),
        usedDate: z.coerce.date().optional(),
    }),
});

// ✅ Update PromoUse Zod Schema
export const updatePromoUseZodSchema = z.object({
    body: z.object({
        promo: z.string().optional(),
        customer: z.string().optional(),
        task: z.string().optional(),
        service: z.string().optional(),
        usedDate: z.coerce.date().optional(),
    }),
});

const PromoUseValidations = {
    createPromoUseZodSchema,
    updatePromoUseZodSchema,
};

export default PromoUseValidations;

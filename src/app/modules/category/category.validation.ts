import { z } from 'zod';

const createCategoryValidationSchema = z.object({
    body: z.object({
        title: z
            .string({ required_error: 'Category title is required' })
            .min(1, 'Category title is required'),
        category_image: z
            .string({
                required_error: 'Category image is required',
            })
            .optional(),
    }),
});
const updateCategoryValidationSchema = z.object({
    body: z.object({
        title: z
            .string({ required_error: 'Category title is required' })
            .min(1, 'Category title is required')
            .optional(),
        category_image: z
            .string({
                required_error: 'Category image is required',
            })
            .optional(),
    }),
});

const categoryValidation = {
    createCategoryValidationSchema,
    updateCategoryValidationSchema,
};

export default categoryValidation;

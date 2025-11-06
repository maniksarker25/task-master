import { z } from 'zod';
import { ENUM_SERVICE_STATUS } from './service.enum';

// Create Service Validation
export const createServiceZodSchema = z.object({
    body: z.object({
        category: z.string({ required_error: 'Category ID is required' }),
        title: z
            .string({ required_error: 'Title is required' })
            .min(1, 'Title cannot be empty'),
        images: z.array(z.string()).optional(),
        description: z
            .string({ required_error: 'Description is required' })
            .min(1, 'Description cannot be empty'),
        location: z
            .object({
                type: z.literal('Point').default('Point'),
                coordinates: z
                    .array(z.number())
                    .length(2, 'Coordinates must have [longitude, latitude]'),
            })
            .optional(),
        availability: z
            .string({ required_error: 'Availability is required' })
            .min(1, 'Availability cannot be empty'),
        experience: z
            .string({ required_error: 'Experience is required' })
            .min(1, 'Experience cannot be empty'),
        onSiteSupport: z.boolean().optional(),
        toolsProvided: z.boolean().optional(),
        languages: z
            .array(z.string({ required_error: 'Language is required' }))
            .min(1, 'At least one language is required'),
        price: z
            .number({ required_error: 'Price range is required' })
            .min(1, 'Price range cannot be empty')
            .positive(),
        status: z.nativeEnum(ENUM_SERVICE_STATUS).optional(),
    }),
});

// Update Service Validation (all optional)
export const updateServiceZodSchema = z.object({
    body: z.object({
        category: z.string().optional(),
        title: z.string().optional(),
        images: z.array(z.string()).optional(),
        description: z.string().optional(),
        location: z
            .object({
                type: z.literal('Point').default('Point'),
                coordinates: z
                    .array(z.number())
                    .length(2, 'Coordinates must have [longitude, latitude]'),
            })
            .optional(),
        availability: z.string().optional(),
        experience: z.string().optional(),
        onSiteSupport: z.boolean().optional(),
        toolsProvided: z.boolean().optional(),
        languages: z.array(z.string()).optional(),
        price: z.number().optional(),
        status: z.nativeEnum(ENUM_SERVICE_STATUS).optional(),
    }),
});

const ServiceValidations = {
    createServiceZodSchema,
    updateServiceZodSchema,
};

export default ServiceValidations;

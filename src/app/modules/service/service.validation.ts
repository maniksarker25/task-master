import { z } from 'zod';
import { ENUM_SERVICE_STATUS } from './service.enum';

// ✅ Create Service Zod Schema
export const createServiceZodSchema = z.object({
    body: z.object({
        category: z.string({ required_error: 'Category ID is required' }),
        title: z
            .string({ required_error: 'Title is required' })
            .min(1, 'Title cannot be empty'),
        images: z.array(z.string()).optional(),
        provider: z.string({ required_error: 'Provider ID is required' }),
        description: z
            .string({ required_error: 'Description is required' })
            .min(1, 'Description cannot be empty'),
        location: z
            .string({ required_error: 'Location is required' })
            .min(1, 'Location cannot be empty'),
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
        priceRange: z
            .string({ required_error: 'Price range is required' })
            .min(1, 'Price range cannot be empty'),
        status: z.nativeEnum(ENUM_SERVICE_STATUS).optional(),
    }),
});

// ✅ Update Service Zod Schema
export const updateServiceZodSchema = z.object({
    body: z.object({
        category: z.string().optional(),
        title: z.string().min(1).optional(),
        images: z.array(z.string()).optional(),
        provider: z.string().optional(),
        description: z.string().min(1).optional(),
        location: z.string().min(1).optional(),
        availability: z.string().min(1).optional(),
        experience: z.string().min(1).optional(),
        onSiteSupport: z.boolean().optional(),
        toolsProvided: z.boolean().optional(),
        languages: z.array(z.string()).optional(),
        priceRange: z.string().min(1).optional(),
        status: z.nativeEnum(ENUM_SERVICE_STATUS).optional(),
    }),
});

const ServiceValidations = {
    createServiceZodSchema,
    updateServiceZodSchema,
};

export default ServiceValidations;

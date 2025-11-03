import { z } from 'zod';

// ✅ Update Provider Zod Schema
export const updateProviderZodSchema = z.object({
    body: z.object({
        user: z.string().optional(),
        name: z.string().min(1).optional(),
        phone: z.string().min(5).optional(),
        email: z.string().email('Invalid email address').optional(),
        profile_image: z.string().optional(),
        city: z.string().optional(),
        street: z.string().optional(),
        address_document: z.string().optional(),
        identificationDocumentType: z.string().optional(),
        identificationDocumentNumber: z.string().optional(),
        identification_document: z.string().optional(),
        bankVerificationNumber: z.string().optional(),
        isVerified: z.boolean().optional(),
        isBankVerificationNumberApproved: z.boolean().optional(),
        isIdentificationDocumentApproved: z.boolean().optional(),
    }),
});

const ProviderValidations = {
    updateProviderZodSchema,
};

export default ProviderValidations;

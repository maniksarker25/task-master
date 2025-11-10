import { z } from 'zod';
import { ENUM_EXTENSION_REQUEST_STATUS } from './extensionRequest.enum';

// ✅ Create Extension Request Zod Schema
export const createExtensionRequestZodSchema = z.object({
    body: z.object({
        task: z.string({ required_error: 'Task ID is required' }),
        requestedBy: z.string().optional(),
        currentDate: z.coerce.date().optional(),
        requestedDate: z.coerce.date({
            required_error: 'Requested date is required',
        }),
        requestedAt: z.coerce.date({
            required_error: 'RequestedAt date is required',
        }),
        reason: z
            .string({ required_error: 'Reason is required' })
            .min(1, 'Reason cannot be empty'),
        status: z
            .nativeEnum(ENUM_EXTENSION_REQUEST_STATUS)
            .default(ENUM_EXTENSION_REQUEST_STATUS.PENDING),
        rejectDetails: z.string().optional(),
        reject_evidence: z.string().optional(),
        reviewedRequestAt: z.coerce.date().optional(),
    }),
});

// ✅ Update Extension Request Zod Schema
export const updateExtensionRequestZodSchema = z.object({
    body: z.object({
        task: z.string().optional(),
        requestedBy: z.string().optional(),
        currentDate: z.coerce.date().optional(),
        requestedDate: z.coerce.date().optional(),
        requestedAt: z.coerce.date().optional(),
        reason: z.string().optional(),
        status: z.nativeEnum(ENUM_EXTENSION_REQUEST_STATUS).optional(),
        rejectDetails: z.string().optional(),
        reject_evidence: z.string().optional(),
        reviewedRequestAt: z.coerce.date().optional(),
    }),
});

const rejectExtensionRequestZodSchema = z.object({
    body: z.object({
        rejectDetails: z.string(),

        reject_evidence: z
            .string()
            .optional()
            .describe('Optional image URL or file reference'),
    }),
});

const ExtensionRequestValidations = {
    createExtensionRequestZodSchema,
    updateExtensionRequestZodSchema,
    rejectExtensionRequestZodSchema,
};

export default ExtensionRequestValidations;

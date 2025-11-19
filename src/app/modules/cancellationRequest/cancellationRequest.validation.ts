import { z } from 'zod';
import { ENUM_CANCELLATION_REQUEST_STATUS } from './cancellationRequest.enum';

// ✅ Create Cancellation Request Zod Schema
export const createCancellationRequestZodSchema = z.object({
    body: z.object({
        task: z.string({ required_error: 'Task ID is required' }),
        requestedBy: z.string().optional(),
        currentDate: z.coerce.date().optional(),
        requestedDateTime: z.coerce.date({
            required_error: 'Requested date is required',
        }),
        reason: z
            .string({ required_error: 'Reason is required' })
            .min(1, 'Reason cannot be empty'),
        status: z
            .nativeEnum(ENUM_CANCELLATION_REQUEST_STATUS)
            .default(ENUM_CANCELLATION_REQUEST_STATUS.PENDING),
        rejectDetails: z.string().optional(),
        reject_evidence: z.string().optional(),
        reviewedRequestAt: z.coerce.date().optional(),
    }),
});

// ✅ Update Cancellation Request Zod Schema
export const updateCancellationRequestZodSchema = z.object({
    body: z.object({
        requestedBy: z.string().optional(),
        currentDate: z.coerce.date().optional(),
        requestedDateTime: z.coerce
            .date({
                required_error: 'Requested date is required',
            })
            .optional(),
        reason: z
            .string({ required_error: 'Reason is required' })
            .min(1, 'Reason cannot be empty')
            .optional(),
        rejectDetails: z.string().optional(),
        reject_evidence: z.string().optional(),
        reviewedRequestAt: z.coerce.date().optional(),
    }),
});

const rejectCancellationRequestZodSchema = z.object({
    body: z.object({
        rejectDetails: z.string(),

        reject_evidence: z
            .string()
            .optional()
            .describe('Optional image URL or file reference'),
    }),
});

const CancellationRequestValidations = {
    createCancellationRequestZodSchema,
    updateCancellationRequestZodSchema,
    rejectCancellationRequestZodSchema,
};

export default CancellationRequestValidations;

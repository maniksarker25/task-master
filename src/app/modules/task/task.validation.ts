import { z } from 'zod';
import {
    ENUM_DONE_BY,
    ENUM_PAYMENT_STATUS,
    ENUM_SCHEDULE_TYPE,
    ENUM_TASK_STATUS,
} from './task.enum';

// ✅ Create Task Zod Schema
export const createTaskZodSchema = z.object({
    body: z.object({
        title: z
            .string({ required_error: 'Title is required' })
            .min(1, 'Title cannot be empty'),
        category: z.string().optional(), // ObjectId
        budget: z
            .number({ required_error: 'Budget is required' })
            .positive('Budget must be positive'),
        status: z.nativeEnum(ENUM_TASK_STATUS).optional(),
        isDeleted: z.boolean().optional(),
        paymentStatus: z.nativeEnum(ENUM_PAYMENT_STATUS).optional(),
        provider: z.string().optional(),
        customer: z.string().optional(),
        payOn: z.string().optional(),
        doneBy: z.nativeEnum(ENUM_DONE_BY).optional(),
        location: z.string().optional(),
        scheduleType: z.nativeEnum(ENUM_SCHEDULE_TYPE).optional(),
        preferredDate: z.coerce.date().optional(),
        preferredTime: z.string().optional(),
        deception: z
            .string({ required_error: 'Deception is required' })
            .min(1, 'Deception cannot be empty'),
        attachments: z.array(z.string()).optional(),
    }),
});

// ✅ Update Task Zod Schema
export const updateTaskZodSchema = z.object({
    body: z.object({
        title: z.string().min(1).optional(),
        category: z.string().optional(),
        budget: z.number().positive().optional(),
        status: z.nativeEnum(ENUM_TASK_STATUS).optional(),
        isDeleted: z.boolean().optional(),
        paymentStatus: z.nativeEnum(ENUM_PAYMENT_STATUS).optional(),
        provider: z.string().optional(),
        customer: z.string().optional(),
        payOn: z.string().optional(),
        doneBy: z.nativeEnum(ENUM_DONE_BY).optional(),
        location: z.string().optional(),
        scheduleType: z.nativeEnum(ENUM_SCHEDULE_TYPE).optional(),
        preferredDate: z.coerce.date().optional(),
        preferredTime: z.string().optional(),
        deception: z.string().min(1).optional(),
        attachments: z.array(z.string()).optional(),
    }),
});

const TaskValidations = {
    createTaskZodSchema,
    updateTaskZodSchema,
};

export default TaskValidations;

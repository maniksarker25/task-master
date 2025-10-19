import { z } from "zod";

export const updateTaskData = z.object({
    body: z.object({
        name: z.string().optional(),
        phone: z.string().optional(),
        address: z.string().optional(),
    }),
});

const TaskValidations = { updateTaskData };
export default TaskValidations;
import { model, Schema } from 'mongoose';
import { ITask } from './task.interface';
import {
    ENUM_DONE_BY,
    ENUM_PAYMENT_STATUS,
    ENUM_SCHEDULE_TYPE,
    ENUM_TASK_STATUS,
} from './task.enum';

const taskSchema = new Schema<ITask>(
    {
        title: { type: String, required: true },
        category: {
            type: Schema.Types.ObjectId,
            ref: 'Category',
        },

        budget: { type: Number, required: true },
        status: {
            type: String,
            enum: Object.values(ENUM_TASK_STATUS),
            default: ENUM_TASK_STATUS.OPEN_FOR_BID,
        },

        isDeleted: { type: Boolean, default: false },

        paymentStatus: {
            type: String,
            enum: Object.values(ENUM_PAYMENT_STATUS),
            default: ENUM_PAYMENT_STATUS.UNPAID,
        },

        provider: { type: Schema.Types.ObjectId, ref: 'Provider' },
        customer: {
            type: Schema.Types.ObjectId,
            ref: 'Customer',
        },

        payOn: { type: String },
        doneBy: { type: String, enum: Object.values(ENUM_DONE_BY) },

        location: { type: String },
        scheduleType: {
            type: String,
            enum: Object.values(ENUM_SCHEDULE_TYPE),
        },
        preferredDate: { type: Date },
        preferredTime: { type: String },
        deception: { type: String, required: true },
        task_attachments: [{ type: String }],
    },
    { timestamps: true }
);

const TaskModel = model<ITask>('Task', taskSchema);
export default TaskModel;

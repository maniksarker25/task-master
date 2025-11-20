import { model, Schema } from 'mongoose';
import {
    ENUM_DONE_BY,
    ENUM_PAYMENT_STATUS,
    ENUM_SCHEDULE_TYPE,
    ENUM_TASK_STATUS,
} from './task.enum';
import { IStatusWithDate, ITask } from './task.interface';

const statusWithDateSchema = new Schema<IStatusWithDate>({
    status: {
        type: String,
        enum: Object.values(ENUM_TASK_STATUS),
        required: true,
    },
    date: {
        type: Date,
        required: true,
    },
});

const taskSchema = new Schema<ITask>(
    {
        title: { type: String, required: true },
        category: {
            type: Schema.Types.ObjectId,
            ref: 'Category',
            required: true,
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
        doneBy: {
            type: String,
            enum: Object.values(ENUM_DONE_BY),
            required: true,
        },

        location: {
            type: {
                type: String,
                enum: ['Point'],
                required: true,
                default: 'Point',
            },
            coordinates: { type: [Number], required: true, index: '2dsphere' },
        },
        address: {
            type: String,
            default: '',
        },
        city: {
            type: String,
            default: '',
        },
        scheduleType: {
            type: String,
            enum: Object.values(ENUM_SCHEDULE_TYPE),
        },
        preferredDate: { type: Date },
        preferredTime: { type: String },
        preferredDeliveryDateTime: { type: Date },
        description: { type: String, required: true },
        task_attachments: [{ type: String }],
        statusWithDate: {
            type: [statusWithDateSchema],
        },
        referralCode: {
            type: String,
            default: Math.random().toString(36).substring(2, 8).toUpperCase(),
            unique: true,
        },
    },

    { timestamps: true }
);

const TaskModel = model<ITask>('Task', taskSchema);
export default TaskModel;

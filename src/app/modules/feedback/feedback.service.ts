import httpStatus from 'http-status';
import AppError from '../../error/appError';
import { IFeedback } from './feedback.interface';

import FeedbackModel from './feedback.model';
import TaskModel from '../task/task.model';
import { ENUM_TASK_STATUS } from '../task/task.enum';

const createFeedbackIntoDB = async (
    currentUserID: string,
    payload: Partial<IFeedback>
) => {
    const task = await TaskModel.findById(payload.task);
    if (!task) {
        throw new AppError(httpStatus.NOT_FOUND, 'Task not found');
    }

    if (task.customer?.toString() !== currentUserID) {
        throw new AppError(
            httpStatus.UNAUTHORIZED,
            'You do not have permission to give feedback for this task'
        );
    }
    if (task.status !== ENUM_TASK_STATUS.COMPLETED) {
        throw new AppError(
            httpStatus.BAD_REQUEST,
            'You can only give feedback after task completion'
        );
    }

    const existingFeedback = await FeedbackModel.findOne({
        task: payload.task,
        customer: currentUserID,
    });
    if (existingFeedback) {
        throw new AppError(
            httpStatus.BAD_REQUEST,
            'Feedback already submitted for this task'
        );
    }

    const result = await FeedbackModel.create({
        ...payload,
        customer: currentUserID,
    });

    return result;
};

const FeedbackServices = { createFeedbackIntoDB };
export default FeedbackServices;

import httpStatus from 'http-status';
import AppError from '../../error/appError';
import { ITask } from './task.interface';

import TaskModel from './task.model';
import bidModel from '../bid/bid.model';

const createTaskIntoDB = async (payload: Partial<ITask>) => {
    const result = (await TaskModel.create(payload)).populate('category');
    return result;
};

const getAllTaskFromDB = async () => {
    const result = await TaskModel.find().populate('category');
    return result;
};
const getSingleTaskFromDB = async (id: string) => {
    const result = await TaskModel.findById(id).populate('category');
    return result;
};

const deleteTaskFromDB = async (id: string) => {
    const taskData = await TaskModel.findById(id);

    if (!taskData) {
        throw new AppError(httpStatus.NOT_FOUND, 'Task not found');
    }

    if (taskData.provider) {
        taskData.isDeleted = true;

        await taskData.save();
    } else {
        await bidModel.deleteMany({ task: taskData._id });

        await TaskModel.findByIdAndDelete(id);
    }

    return { message: 'Task deleted successfully' };
};
const TaskServices = {
    createTaskIntoDB,
    getAllTaskFromDB,
    getSingleTaskFromDB,
    deleteTaskFromDB,
};
export default TaskServices;

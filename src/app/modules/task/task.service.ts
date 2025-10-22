import { ITask } from './task.interface';

import TaskModel from './task.model';

const createTaskIntoDB = async (payload: Partial<ITask>) => {
    const result = (await TaskModel.create(payload)).populate('category');
    return result;
};

const getAllTaskFromDB = async () => {
    const result = await TaskModel.find().populate('category');
    return result;
};

const TaskServices = { createTaskIntoDB, getAllTaskFromDB };
export default TaskServices;

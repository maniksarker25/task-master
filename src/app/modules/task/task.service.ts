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
const getSingleTaskFromDB = async (id: string) => {
    const result = await TaskModel.findById(id).populate('category');
    return result;
};

const deleteTaskFromDB = async (id: string) => {};
const TaskServices = {
    createTaskIntoDB,
    getAllTaskFromDB,
    getSingleTaskFromDB,
};
export default TaskServices;

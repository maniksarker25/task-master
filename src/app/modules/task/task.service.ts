import httpStatus from "http-status";
import AppError from "../../error/appError";
import { ITask } from "./task.interface";
import taskModel from "./task.model";

const updateUserProfile = async (id: string, payload: Partial<ITask>) => {
    if (payload.email || payload.username) {
        throw new AppError(httpStatus.BAD_REQUEST, "You cannot change the email or username");
    }
    const user = await taskModel.findById(id);
    if (!user) {
        throw new AppError(httpStatus.NOT_FOUND, "Profile not found");
    }
    return await taskModel.findByIdAndUpdate(id, payload, {
        new: true,
        runValidators: true,
    });
};

const TaskServices = { updateUserProfile };
export default TaskServices;
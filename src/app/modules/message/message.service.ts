import httpStatus from "http-status";
import AppError from "../../error/appError";
import { IMessage } from "./message.interface";
import messageModel from "./message.model";

const updateUserProfile = async (id: string, payload: Partial<IMessage>) => {
    if (payload.email || payload.username) {
        throw new AppError(httpStatus.BAD_REQUEST, "You cannot change the email or username");
    }
    const user = await messageModel.findById(id);
    if (!user) {
        throw new AppError(httpStatus.NOT_FOUND, "Profile not found");
    }
    return await messageModel.findByIdAndUpdate(id, payload, {
        new: true,
        runValidators: true,
    });
};

const MessageServices = { updateUserProfile };
export default MessageServices;
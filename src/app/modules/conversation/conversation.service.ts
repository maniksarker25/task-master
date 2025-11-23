import httpStatus from "http-status";
import AppError from "../../error/appError";
import { IConversation } from "./conversation.interface";
import conversationModel from "./conversation.model";

const updateUserProfile = async (id: string, payload: Partial<IConversation>) => {
    if (payload.email || payload.username) {
        throw new AppError(httpStatus.BAD_REQUEST, "You cannot change the email or username");
    }
    const user = await conversationModel.findById(id);
    if (!user) {
        throw new AppError(httpStatus.NOT_FOUND, "Profile not found");
    }
    return await conversationModel.findByIdAndUpdate(id, payload, {
        new: true,
        runValidators: true,
    });
};

const ConversationServices = { updateUserProfile };
export default ConversationServices;
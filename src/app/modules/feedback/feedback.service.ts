import httpStatus from "http-status";
import AppError from "../../error/appError";
import { IFeedback } from "./feedback.interface";
import feedbackModel from "./feedback.model";

const updateUserProfile = async (id: string, payload: Partial<IFeedback>) => {
    if (payload.email || payload.username) {
        throw new AppError(httpStatus.BAD_REQUEST, "You cannot change the email or username");
    }
    const user = await feedbackModel.findById(id);
    if (!user) {
        throw new AppError(httpStatus.NOT_FOUND, "Profile not found");
    }
    return await feedbackModel.findByIdAndUpdate(id, payload, {
        new: true,
        runValidators: true,
    });
};

const FeedbackServices = { updateUserProfile };
export default FeedbackServices;
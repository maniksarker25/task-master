import httpStatus from "http-status";
import AppError from "../../error/appError";
import { IQuestion } from "./question.interface";
import questionModel from "./question.model";

const updateUserProfile = async (id: string, payload: Partial<IQuestion>) => {
    if (payload.email || payload.username) {
        throw new AppError(httpStatus.BAD_REQUEST, "You cannot change the email or username");
    }
    const user = await questionModel.findById(id);
    if (!user) {
        throw new AppError(httpStatus.NOT_FOUND, "Profile not found");
    }
    return await questionModel.findByIdAndUpdate(id, payload, {
        new: true,
        runValidators: true,
    });
};

const QuestionServices = { updateUserProfile };
export default QuestionServices;
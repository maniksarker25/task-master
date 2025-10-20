import httpStatus from "http-status";
import AppError from "../../error/appError";
import { IDispute } from "./dispute.interface";
import disputeModel from "./dispute.model";

const updateUserProfile = async (id: string, payload: Partial<IDispute>) => {
    if (payload.email || payload.username) {
        throw new AppError(httpStatus.BAD_REQUEST, "You cannot change the email or username");
    }
    const user = await disputeModel.findById(id);
    if (!user) {
        throw new AppError(httpStatus.NOT_FOUND, "Profile not found");
    }
    return await disputeModel.findByIdAndUpdate(id, payload, {
        new: true,
        runValidators: true,
    });
};

const DisputeServices = { updateUserProfile };
export default DisputeServices;
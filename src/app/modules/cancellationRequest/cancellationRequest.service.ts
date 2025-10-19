import httpStatus from "http-status";
import AppError from "../../error/appError";
import { ICancellationRequest } from "./cancellationRequest.interface";
import cancellationRequestModel from "./cancellationRequest.model";

const updateUserProfile = async (id: string, payload: Partial<ICancellationRequest>) => {
    if (payload.email || payload.username) {
        throw new AppError(httpStatus.BAD_REQUEST, "You cannot change the email or username");
    }
    const user = await cancellationRequestModel.findById(id);
    if (!user) {
        throw new AppError(httpStatus.NOT_FOUND, "Profile not found");
    }
    return await cancellationRequestModel.findByIdAndUpdate(id, payload, {
        new: true,
        runValidators: true,
    });
};

const CancellationRequestServices = { updateUserProfile };
export default CancellationRequestServices;
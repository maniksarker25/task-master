import httpStatus from "http-status";
import AppError from "../../error/appError";
import { IExtensionRequest } from "./extensionRequest.interface";
import extensionRequestModel from "./extensionRequest.model";

const updateUserProfile = async (id: string, payload: Partial<IExtensionRequest>) => {
    if (payload.email || payload.username) {
        throw new AppError(httpStatus.BAD_REQUEST, "You cannot change the email or username");
    }
    const user = await extensionRequestModel.findById(id);
    if (!user) {
        throw new AppError(httpStatus.NOT_FOUND, "Profile not found");
    }
    return await extensionRequestModel.findByIdAndUpdate(id, payload, {
        new: true,
        runValidators: true,
    });
};

const ExtensionRequestServices = { updateUserProfile };
export default ExtensionRequestServices;
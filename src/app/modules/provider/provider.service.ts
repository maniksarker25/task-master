import httpStatus from "http-status";
import AppError from "../../error/appError";
import { IProvider } from "./provider.interface";
import providerModel from "./provider.model";

const updateUserProfile = async (id: string, payload: Partial<IProvider>) => {
    if (payload.email || payload.username) {
        throw new AppError(httpStatus.BAD_REQUEST, "You cannot change the email or username");
    }
    const user = await providerModel.findById(id);
    if (!user) {
        throw new AppError(httpStatus.NOT_FOUND, "Profile not found");
    }
    return await providerModel.findByIdAndUpdate(id, payload, {
        new: true,
        runValidators: true,
    });
};

const ProviderServices = { updateUserProfile };
export default ProviderServices;
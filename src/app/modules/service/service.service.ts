import httpStatus from "http-status";
import AppError from "../../error/appError";
import { IService } from "./service.interface";
import serviceModel from "./service.model";

const updateUserProfile = async (id: string, payload: Partial<IService>) => {
    if (payload.email || payload.username) {
        throw new AppError(httpStatus.BAD_REQUEST, "You cannot change the email or username");
    }
    const user = await serviceModel.findById(id);
    if (!user) {
        throw new AppError(httpStatus.NOT_FOUND, "Profile not found");
    }
    return await serviceModel.findByIdAndUpdate(id, payload, {
        new: true,
        runValidators: true,
    });
};

const ServiceServices = { updateUserProfile };
export default ServiceServices;
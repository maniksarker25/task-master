import httpStatus from "http-status";
import AppError from "../../error/appError";
import { ICustomer } from "./customer.interface";
import customerModel from "./customer.model";

const updateUserProfile = async (id: string, payload: Partial<ICustomer>) => {
    if (payload.email || payload.username) {
        throw new AppError(httpStatus.BAD_REQUEST, "You cannot change the email or username");
    }
    const user = await customerModel.findById(id);
    if (!user) {
        throw new AppError(httpStatus.NOT_FOUND, "Profile not found");
    }
    return await customerModel.findByIdAndUpdate(id, payload, {
        new: true,
        runValidators: true,
    });
};

const CustomerServices = { updateUserProfile };
export default CustomerServices;
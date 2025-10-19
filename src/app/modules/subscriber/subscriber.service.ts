import httpStatus from "http-status";
import AppError from "../../error/appError";
import { ISubscriber } from "./subscriber.interface";
import subscriberModel from "./subscriber.model";

const updateUserProfile = async (id: string, payload: Partial<ISubscriber>) => {
    if (payload.email || payload.username) {
        throw new AppError(httpStatus.BAD_REQUEST, "You cannot change the email or username");
    }
    const user = await subscriberModel.findById(id);
    if (!user) {
        throw new AppError(httpStatus.NOT_FOUND, "Profile not found");
    }
    return await subscriberModel.findByIdAndUpdate(id, payload, {
        new: true,
        runValidators: true,
    });
};

const SubscriberServices = { updateUserProfile };
export default SubscriberServices;
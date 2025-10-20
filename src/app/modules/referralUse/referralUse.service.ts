import httpStatus from "http-status";
import AppError from "../../error/appError";
import { IReferralUse } from "./referralUse.interface";
import referralUseModel from "./referralUse.model";

const updateUserProfile = async (id: string, payload: Partial<IReferralUse>) => {
    if (payload.email || payload.username) {
        throw new AppError(httpStatus.BAD_REQUEST, "You cannot change the email or username");
    }
    const user = await referralUseModel.findById(id);
    if (!user) {
        throw new AppError(httpStatus.NOT_FOUND, "Profile not found");
    }
    return await referralUseModel.findByIdAndUpdate(id, payload, {
        new: true,
        runValidators: true,
    });
};

const ReferralUseServices = { updateUserProfile };
export default ReferralUseServices;
import httpStatus from "http-status";
import AppError from "../../error/appError";
import { IReferral } from "./referral.interface";
import referralModel from "./referral.model";

const updateUserProfile = async (id: string, payload: Partial<IReferral>) => {
    if (payload.email || payload.username) {
        throw new AppError(httpStatus.BAD_REQUEST, "You cannot change the email or username");
    }
    const user = await referralModel.findById(id);
    if (!user) {
        throw new AppError(httpStatus.NOT_FOUND, "Profile not found");
    }
    return await referralModel.findByIdAndUpdate(id, payload, {
        new: true,
        runValidators: true,
    });
};

const ReferralServices = { updateUserProfile };
export default ReferralServices;
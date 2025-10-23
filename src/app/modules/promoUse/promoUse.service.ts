import httpStatus from "http-status";
import AppError from "../../error/appError";
import { IPromoUse } from "./promoUse.interface";
import promoUseModel from "./promoUse.model";

const updateUserProfile = async (id: string, payload: Partial<IPromoUse>) => {
    if (payload.email || payload.username) {
        throw new AppError(httpStatus.BAD_REQUEST, "You cannot change the email or username");
    }
    const user = await promoUseModel.findById(id);
    if (!user) {
        throw new AppError(httpStatus.NOT_FOUND, "Profile not found");
    }
    return await promoUseModel.findByIdAndUpdate(id, payload, {
        new: true,
        runValidators: true,
    });
};

const PromoUseServices = { updateUserProfile };
export default PromoUseServices;
import httpStatus from "http-status";
import AppError from "../../error/appError";
import { IPromo } from "./promo.interface";
import promoModel from "./promo.model";

const updateUserProfile = async (id: string, payload: Partial<IPromo>) => {
    if (payload.email || payload.username) {
        throw new AppError(httpStatus.BAD_REQUEST, "You cannot change the email or username");
    }
    const user = await promoModel.findById(id);
    if (!user) {
        throw new AppError(httpStatus.NOT_FOUND, "Profile not found");
    }
    return await promoModel.findByIdAndUpdate(id, payload, {
        new: true,
        runValidators: true,
    });
};

const PromoServices = { updateUserProfile };
export default PromoServices;
import httpStatus from "http-status";
import AppError from "../../error/appError";
import { ISentOffer } from "./sentOffer.interface";
import sentOfferModel from "./sentOffer.model";

const updateUserProfile = async (id: string, payload: Partial<ISentOffer>) => {
    if (payload.email || payload.username) {
        throw new AppError(httpStatus.BAD_REQUEST, "You cannot change the email or username");
    }
    const user = await sentOfferModel.findById(id);
    if (!user) {
        throw new AppError(httpStatus.NOT_FOUND, "Profile not found");
    }
    return await sentOfferModel.findByIdAndUpdate(id, payload, {
        new: true,
        runValidators: true,
    });
};

const SentOfferServices = { updateUserProfile };
export default SentOfferServices;
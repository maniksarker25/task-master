import httpStatus from "http-status";
import AppError from "../../error/appError";
import { IPayment } from "./payment.interface";
import paymentModel from "./payment.model";

const updateUserProfile = async (id: string, payload: Partial<IPayment>) => {
    if (payload.email || payload.username) {
        throw new AppError(httpStatus.BAD_REQUEST, "You cannot change the email or username");
    }
    const user = await paymentModel.findById(id);
    if (!user) {
        throw new AppError(httpStatus.NOT_FOUND, "Profile not found");
    }
    return await paymentModel.findByIdAndUpdate(id, payload, {
        new: true,
        runValidators: true,
    });
};

const PaymentServices = { updateUserProfile };
export default PaymentServices;
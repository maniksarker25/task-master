import httpStatus from "http-status";
import AppError from "../../error/appError";
import { ITestimonial } from "./testimonial.interface";
import testimonialModel from "./testimonial.model";

const updateUserProfile = async (id: string, payload: Partial<ITestimonial>) => {
    if (payload.email || payload.username) {
        throw new AppError(httpStatus.BAD_REQUEST, "You cannot change the email or username");
    }
    const user = await testimonialModel.findById(id);
    if (!user) {
        throw new AppError(httpStatus.NOT_FOUND, "Profile not found");
    }
    return await testimonialModel.findByIdAndUpdate(id, payload, {
        new: true,
        runValidators: true,
    });
};

const TestimonialServices = { updateUserProfile };
export default TestimonialServices;
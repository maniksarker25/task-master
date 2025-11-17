import httpStatus from 'http-status';
import AppError from '../../error/appError';
import { IFaq } from './faq.interface';
import faqModel from './faq.model';

const createFaqIntoDB = async (payload: IFaq) => {
    const result = await faqModel.create(payload);
    return result;
};

const getAllFaqFromDB = async () => {
    const result = await faqModel.find();
    return result;
};

const updateFaqIntoDB = async (id: string, payload: Partial<IFaq>) => {
    const result = await faqModel.findByIdAndUpdate(id, payload, { new: true });
    if (!result) {
        throw new AppError(httpStatus.NOT_FOUND, 'FAQ not found');
    }
    return result;
};

const deleteFaqFromDB = async (id: string) => {
    const result = await faqModel.findByIdAndDelete(id);
    if (!result) {
        throw new AppError(httpStatus.NOT_FOUND, 'FAQ not found');
    }
    return result;
};

const FaqServices = {
    createFaqIntoDB,
    getAllFaqFromDB,
    updateFaqIntoDB,
    deleteFaqFromDB,
};
export default FaqServices;

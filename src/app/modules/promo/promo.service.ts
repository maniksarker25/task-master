import httpStatus from 'http-status';
import AppError from '../../error/appError';
import { IPromo } from './promo.interface';
import PromoModel from './promo.model';

const createPromoIntoDB = async (payload: IPromo) => {
    const result = await PromoModel.create(payload);
    return result;
};

const getAllPromoFromDB = async () => {
    const result = await PromoModel.find();
    if (!result) {
        throw new AppError(httpStatus.NOT_FOUND, 'Promos not found');
    }
    return result;
};
const getSinglePromoFromDB = async (id: string) => {
    const result = await PromoModel.findById(id);
    if (!result) {
        throw new AppError(httpStatus.NOT_FOUND, 'Promo not found');
    }
    return result;
};
const updatePromoInDB = async (id: string, payload: Partial<IPromo>) => {
    const result = await PromoModel.findByIdAndUpdate(id, payload, {
        new: true,
    });
    if (!result) {
        throw new AppError(httpStatus.NOT_FOUND, 'Promo not found');
    }
    return result;
};
const deletePromoFromDB = async (id: string) => {
    const result = await PromoModel.findByIdAndDelete(id);
    if (!result) {
        throw new AppError(httpStatus.NOT_FOUND, 'Promo not found');
    }
    return result;
};
const PromoServices = {
    createPromoIntoDB,
    getAllPromoFromDB,
    getSinglePromoFromDB,
    updatePromoInDB,
    deletePromoFromDB,
};
export default PromoServices;

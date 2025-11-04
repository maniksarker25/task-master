import httpStatus from 'http-status';
import AppError from '../../error/appError';
import { IPromoUse } from './promoUse.interface';
import promoUseModel from './promoUse.model';

const createPromoUseIntoDB = async (payload: Partial<IPromoUse>) => {
    const created = await promoUseModel.create(payload);
    return created;
};

const updatePromoUseByIdFromDB = async (
    id: string,
    payload: Partial<IPromoUse>
) => {
    const doc = await promoUseModel.findById(id);
    if (!doc) {
        throw new AppError(httpStatus.NOT_FOUND, 'PromoUse not found');
    }
    return await promoUseModel.findByIdAndUpdate(id, payload, {
        new: true,
    });
};

const getAllPromoUsesFromDB = async () => {
    return await promoUseModel
        .find()
        .populate('promo customer task service')
        .lean();
};

const PromoUseServices = {
    createPromoUseIntoDB,
    updatePromoUseByIdFromDB,
    getAllPromoUsesFromDB,
};
export default PromoUseServices;

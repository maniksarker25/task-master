import httpStatus from 'http-status';
import AppError from '../../error/appError';
import { IPromo } from './promo.interface';
import PromoModel from './promo.model';

const createPromoIntoDB = async (payload: IPromo) => {
    const result = await PromoModel.create(payload);
    return result;
};

const getAllPromoFromDB = async (query: Record<string, unknown>) => {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 10;
    const skip = (page - 1) * limit;
    const result = await PromoModel.find().skip(skip).limit(limit).sort({
        createdAt: -1,
    });

    const total = await PromoModel.countDocuments();
    const totalPage = Math.ceil(total / limit);
    if (!result) {
        throw new AppError(httpStatus.NOT_FOUND, 'Promos not found');
    }
    return {
        meta: {
            page,
            limit,
            total,
            totalPage,
        },
        result,
    };
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
const verifyPromoFromDB = async (promoCode: string) => {
    const promo = await PromoModel.findOne({ promoCode });

    // Promo Not Found
    if (!promo) {
        throw new AppError(httpStatus.NOT_FOUND, 'Promo code is not valid');
    }

    const now = new Date();

    // If promo has not started yet
    if (promo.startDate > now) {
        throw new AppError(httpStatus.BAD_REQUEST, 'Promo is not active yet');
    }

    // If promo expired
    if (promo.endDate < now) {
        throw new AppError(httpStatus.BAD_REQUEST, 'Promo code has expired');
    }

    // Promo status must be ACTIVE
    if (promo.status !== 'ACTIVE') {
        throw new AppError(httpStatus.BAD_REQUEST, 'Promo is not active');
    }

    // If usedCount is null/undefined → treat as 0
    const used = promo.usedCount ?? 0;

    // Check usage limit
    if (used >= promo.limit) {
        throw new AppError(httpStatus.BAD_REQUEST, 'Promo usage limit reached');
    }

    // Return only safe/public data
    return promo;
};

const PromoServices = {
    createPromoIntoDB,
    getAllPromoFromDB,
    getSinglePromoFromDB,
    updatePromoInDB,
    deletePromoFromDB,
    verifyPromoFromDB,
};
export default PromoServices;

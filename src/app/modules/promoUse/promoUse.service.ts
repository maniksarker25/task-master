import httpStatus from 'http-status';
import AppError from '../../error/appError';
import { IPromoUse } from './promoUse.interface';
import promoUseModel from './promoUse.model';
import PromoModel from '../promo/promo.model';

const createPromoUseIntoDB = async (
    payload: Partial<IPromoUse>,
    profileID: string
) => {
    // 1. Check promo exists
    const promo = await PromoModel.findById(payload.promo);
    if (!promo) {
        throw new AppError(httpStatus.NOT_FOUND, 'Promo code is not valid');
    }

    const now = new Date();

    // 2. Promo start validation
    if (promo.startDate > now) {
        throw new AppError(httpStatus.BAD_REQUEST, 'Promo has not started yet');
    }

    // 3. Promo expiration validation
    if (promo.endDate < now) {
        throw new AppError(httpStatus.BAD_REQUEST, 'Promo has expired');
    }

    // 4. Promo limit check
    const used = promo.usedCount ?? 0;
    if (used >= promo.limit) {
        throw new AppError(httpStatus.BAD_REQUEST, 'Promo limit reached');
    }

    // 5. ❗ Check if this task already has a promo applied
    const alreadyUsed = await promoUseModel.findOne({
        task: payload.task,
    });

    if (alreadyUsed) {
        throw new AppError(
            httpStatus.BAD_REQUEST,
            'This task already has a promo applied'
        );
    }

    // 6. Create promo use entry
    const created = await promoUseModel.create({
        ...payload,
        customer: profileID,
    });

    // 7. Increase promo used count
    promo.usedCount = used + 1;
    await promo.save();

    return created;
};
const getAllPromoUsesFromDB = async () => {
    return await promoUseModel.find().populate('promo customer task').lean();
};

const PromoUseServices = {
    createPromoUseIntoDB,

    getAllPromoUsesFromDB,
};
export default PromoUseServices;

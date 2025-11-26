/* eslint-disable @typescript-eslint/no-explicit-any */
import httpStatus from 'http-status';
import AppError from '../../error/appError';
import { USER_ROLE } from '../user/user.constant';
import { Customer } from '../customer/customer.model';
import ReferralUseModel from './referralUse.model';
import { Provider } from '../provider/provider.model';
import ReferralModel from '../referral/referral.model';
import {
    ENUM_REFERRAL_FOR,
    ENUM_REFERRAL_STATUS,
} from '../referral/referral.enum';

type TRole = 'customer' | 'provider';

const verifyReferralCodeFromDB = async (
    code: string,
    profileId: string,
    role: TRole
) => {
    // ============================
    // CUSTOMER → CUSTOMER
    // ============================
    if (role === USER_ROLE.customer) {
        const referrer = await Customer.findOne({ referralCode: code });

        if (!referrer) {
            throw new AppError(httpStatus.NOT_FOUND, 'Invalid referral code');
        }

        // Prevent self-referral
        if (referrer._id.toString() === profileId) {
            throw new AppError(
                httpStatus.BAD_REQUEST,
                'You cannot refer yourself'
            );
        }

        const referred = await Customer.findById(profileId);
        if (!referred)
            throw new AppError(httpStatus.NOT_FOUND, 'Customer not found');

        const referral = await ReferralModel.findOne({
            referralFor: ENUM_REFERRAL_FOR.CUSTOMER,
            status: ENUM_REFERRAL_STATUS.ACTIVE,
        });
        if (!referral)
            throw new AppError(
                httpStatus.NOT_FOUND,
                'Referral settings not found'
            );

        // Create referral usage
        const created = await ReferralUseModel.create({
            referrer: referrer._id,
            referrerFromModel: 'Customer',

            referred: referred._id,
            referredFromModel: 'Customer',

            referral: referral._id,
        });

        // POPULATE ALL
        const populated = await ReferralUseModel.findById(created._id)
            .populate('referral')
            .populate('referrer')
            .populate('referred');

        return populated;
    }

    // ============================
    // PROVIDER → PROVIDER
    // ============================
    if (role === USER_ROLE.provider) {
        const referrer = await Provider.findOne({ referralCode: code });

        if (!referrer) {
            throw new AppError(httpStatus.NOT_FOUND, 'Invalid referral code');
        }

        if (referrer._id.toString() === profileId) {
            throw new AppError(
                httpStatus.BAD_REQUEST,
                'You cannot refer yourself'
            );
        }

        const referred = await Provider.findById(profileId);
        if (!referred)
            throw new AppError(httpStatus.NOT_FOUND, 'Provider not found');

        const referral = await ReferralModel.findOne({
            referralFor: ENUM_REFERRAL_FOR.PROVIDER,
            status: ENUM_REFERRAL_STATUS.ACTIVE,
        });

        if (!referral)
            throw new AppError(
                httpStatus.NOT_FOUND,
                'Referral settings not found'
            );

        // Create referral usage
        const created = await ReferralUseModel.create({
            referrer: referrer._id,
            referrerFromModel: 'Provider',

            referred: referred._id,
            referredFromModel: 'Provider',

            referral: referral._id,
        });

        // POPULATE ALL
        const populated = await ReferralUseModel.findById(created._id)
            .populate('referral')
            .populate('referrer')
            .populate('referred');

        return populated;
    }

    throw new AppError(httpStatus.BAD_REQUEST, 'Invalid role');
};

const getMyReferralFromDB = async (profileId: string) => {
    const result = await ReferralUseModel.find({ referrer: profileId });
    return result;
};

const ReferralUseServices = {
    verifyReferralCodeFromDB,
    getMyReferralFromDB,
};
export default ReferralUseServices;

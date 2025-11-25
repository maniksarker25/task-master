import httpStatus from 'http-status';
import AppError from '../../error/appError';
import { USER_ROLE } from '../user/user.constant';
import { Customer } from '../customer/customer.model';
import ReferralUseModel from './referralUse.model';
import { Provider } from '../provider/provider.model';
import ReferralModel from '../referral/referral.model';
import { ENUM_REFERRAL_FOR } from '../referral/referral.enum';
import { IReferral } from '../referral/referral.interface';

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

const createReferralUseFromDB = async (
    profileId: string,
    role: 'customer' | 'provider',
    data: { referrer: string; referred: string; referral: string }
) => {
    // -----------------------------
    // 1️⃣ Find my position
    // -----------------------------
    let myPosition: 'referrer' | 'referred' | '' = '';

    if (profileId === data.referrer) myPosition = 'referrer';
    if (profileId === data.referred) myPosition = 'referred';

    if (myPosition === '') {
        throw new AppError(
            httpStatus.BAD_REQUEST,
            'You must be the referrer or referred to create referral use.'
        );
    }

    // -----------------------------
    // 2️⃣ Helper to load user
    // -----------------------------
    const findUserByRole = async (id: string, r: 'customer' | 'provider') => {
        if (r === 'customer') return await Customer.findById(id);
        return await Provider.findById(id);
    };

    // -----------------------------
    // 3️⃣ Validation if I am referrer
    // -----------------------------
    if (myPosition === 'referrer') {
        const referredUser = await findUserByRole(data.referred, role);
        if (!referredUser) {
            throw new AppError(httpStatus.NOT_FOUND, 'Referred user not found');
        }
    }

    // -----------------------------
    // 4️⃣ Validation if I am referred
    // -----------------------------
    if (myPosition === 'referred') {
        const referrerUser = await findUserByRole(data.referrer, role);
        if (!referrerUser) {
            throw new AppError(httpStatus.NOT_FOUND, 'Referrer user not found');
        }
    }

    // -----------------------------
    // 5️⃣ Determine model names for schema
    // -----------------------------
    const referrerFromModel = role === 'customer' ? 'Customer' : 'Provider';

    const referredFromModel = role === 'customer' ? 'Customer' : 'Provider';

    // -----------------------------
    // 6️⃣ Create referral use record
    // -----------------------------
    const result = await ReferralUseModel.create({
        ...data,
        referrerFromModel,
        referredFromModel,
    });

    return result;
};

const ReferralUseServices = {
    verifyReferralCodeFromDB,
    getMyReferralFromDB,
    createReferralUseFromDB,
};
export default ReferralUseServices;

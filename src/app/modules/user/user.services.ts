/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-unused-vars */

import httpStatus from 'http-status';
import { JwtPayload } from 'jsonwebtoken';
import mongoose from 'mongoose';
import cron from 'node-cron';
import config from '../../config';
import AppError from '../../error/appError';
import registrationSuccessEmailBody from '../../mailTemplate/registerSucessEmail';
import sendEmail from '../../utilities/sendEmail';

import { deleteFileFromS3 } from '../../helper/deleteFromS3';
import { sendSMS } from '../../helper/sendSms';
import { ICustomer } from '../customer/customer.interface';
import { Customer } from '../customer/customer.model';
import { Provider } from '../provider/provider.model';
import SuperAdmin from '../superAdmin/superAdmin.model';
import { USER_ROLE } from './user.constant';
import { TUser, TUserRole } from './user.interface';
import { User } from './user.model';
import { createToken } from './user.utils';
const generateVerifyCode = (): number => {
    return Math.floor(10000 + Math.random() * 90000);
};

const registerCustomer = async (
    payload: ICustomer & {
        password: string;
        confirmPassword: string;
        role: 'provider' | 'customer';
        playerId?: string;
    }
) => {
    const { password, confirmPassword, playerId, role, ...userData } = payload;

    if (password !== confirmPassword) {
        throw new AppError(
            httpStatus.BAD_REQUEST,
            "Password and confirm password doesn't match"
        );
    }

    const emailExist = await User.findOne({ email: userData.email });
    if (emailExist) {
        throw new AppError(httpStatus.BAD_REQUEST, 'This email already exists');
    }

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const verifyCode =
            process.env.NODE_ENV == 'production' ? generateVerifyCode() : 11111;

        const userDataPayload: Partial<TUser> = {
            email: userData?.email,
            phone: userData?.phone,
            password,
            role,
            verifyCode,
            codeExpireIn: new Date(Date.now() + 5 * 60000), // 5 minutes expiry
        };

        if (playerId) {
            userDataPayload.playerIds = [playerId];
        }

        // Create user
        const [user] = await User.create([userDataPayload], { session });

        // Create profile (customer or provider)
        let profile;
        if (role === 'customer') {
            const customerPayload = {
                ...userData,
                user: user._id,
            };
            [profile] = await Customer.create([customerPayload], { session });
        } else {
            const providerPayload = {
                ...userData,
                user: user._id,
            };
            [profile] = await Provider.create([providerPayload], { session });
        }

        // Link profile to user
        await User.findByIdAndUpdate(
            user._id,
            { profileId: profile._id },
            { session }
        );

        // Prepare SMS
        const smsMessage = `Thank you for registering with Task Alley! Please verify your phone using this code: ${verifyCode}. 
The code will expire in 5 minutes. If not verified within this time, you’ll need to register again.`;

        //!TODO: need to send sms to phone
        await sendSMS(userData.phone, smsMessage);

        // If SMS sent successfully, commit transaction
        await session.commitTransaction();
        session.endSession();

        return profile;
    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        throw error;
    }
};

const verifyCode = async (email: string, verifyCode: number) => {
    const user = await User.findOne({ email: email });
    if (!user) {
        throw new AppError(httpStatus.NOT_FOUND, 'User not found');
    }
    if (user.codeExpireIn < new Date(Date.now())) {
        throw new AppError(httpStatus.BAD_REQUEST, 'Verify code is expired');
    }
    if (verifyCode !== user.verifyCode) {
        throw new AppError(httpStatus.BAD_REQUEST, "Code doesn't match");
    }
    const result = await User.findOneAndUpdate(
        { email: email },
        { isVerified: true },
        { new: true, runValidators: true }
    );

    if (!result) {
        throw new AppError(
            httpStatus.SERVICE_UNAVAILABLE,
            'Server temporary unable please try again letter'
        );
    }

    // Create JWT tokens
    const jwtPayload = {
        id: result?._id,
        profileId: result?.profileId,
        email: result?.email,
        role: result?.role as TUserRole,
    };

    const accessToken = createToken(
        jwtPayload,
        config.jwt_access_secret as string,
        config.jwt_access_expires_in as string
    );
    const refreshToken = createToken(
        jwtPayload,
        config.jwt_refresh_secret as string,
        config.jwt_refresh_expires_in as string
    );

    return {
        accessToken,
        refreshToken,
    };
};

const resendVerifyCode = async (email: string) => {
    const user = await User.findOne({ email: email });
    if (!user) {
        throw new AppError(httpStatus.NOT_FOUND, 'User not found');
    }
    const verifyCode = generateVerifyCode();
    const updateUser = await User.findOneAndUpdate(
        { email: email },
        {
            verifyCode: verifyCode,
            codeExpireIn: new Date(Date.now() + 5 * 60000),
        },
        { new: true, runValidators: true }
    );
    if (!updateUser) {
        throw new AppError(
            httpStatus.INTERNAL_SERVER_ERROR,
            'Something went wrong . Please again resend the code after a few second'
        );
    }
    sendEmail({
        email: user.email,
        subject: 'Activate Your Account',
        html: registrationSuccessEmailBody('Dear', updateUser.verifyCode),
    });
    return null;
};

const getMyProfile = async (userData: JwtPayload) => {
    let result = null;
    if (userData.role === USER_ROLE.customer) {
        result = await Customer.findOne({ email: userData.email });
    }
    if (userData.role === USER_ROLE.provider) {
        result = await Provider.findOne({ email: userData.email });
    } else if (userData.role === USER_ROLE.superAdmin) {
        result = await SuperAdmin.findOne({ email: userData.email });
    }
    return result;
};

const deleteUserAccount = async (user: JwtPayload, password: string) => {
    const userData = await User.findById(user.id);

    if (!userData) {
        throw new AppError(httpStatus.NOT_FOUND, 'User not found');
    }
    if (!(await User.isPasswordMatched(password, userData?.password))) {
        throw new AppError(httpStatus.FORBIDDEN, 'Password do not match');
    }

    await Customer.findByIdAndDelete(user.profileId);
    await User.findByIdAndDelete(user.id);

    return null;
};

// update user
const updateUserProfile = async (userData: JwtPayload, payload: any) => {
    if (payload.email || payload.phone) {
        throw new AppError(
            httpStatus.BAD_REQUEST,
            'You can not change the email or phone number'
        );
    }
    if (userData.role == USER_ROLE.customer) {
        const user = await Customer.findById(userData.profileId);
        if (!user) {
            throw new AppError(httpStatus.NOT_FOUND, 'Profile not found');
        }
        if (payload.city) {
            payload.isAddressProvided = true;
        }
        const result = await Customer.findByIdAndUpdate(
            userData.profileId,
            payload,
            {
                new: true,
                runValidators: true,
            }
        );
        if (payload.profile_image && user.profile_image) {
            deleteFileFromS3(user.profile_image);
        }
        if (payload.address_document && user.address_document) {
            deleteFileFromS3(user.address_document);
        }
        return result;
    } else if (userData.role == USER_ROLE.superAdmin) {
        const admin = await SuperAdmin.findById(userData.profileId);
        if (!admin) {
            throw new AppError(httpStatus.NOT_FOUND, 'Profile not found');
        }
        const result = await SuperAdmin.findByIdAndUpdate(
            userData.profileId,
            payload,
            { new: true, runValidators: true }
        );
        if (payload.profile_image && admin.profile_image) {
            deleteFileFromS3(admin.profile_image);
        }

        return result;
    } else if (userData.role == USER_ROLE.provider) {
        const provider = await Provider.findById(userData.profileId);
        if (!provider) {
            throw new AppError(httpStatus.NOT_FOUND, 'Profile not found');
        }
        if (payload.city) {
            payload.isAddressProvided = true;
        }
        const result = await Provider.findByIdAndUpdate(
            userData.profileId,
            payload,
            { new: true, runValidators: true }
        );
        if (payload.profile_image && provider.profile_image) {
            deleteFileFromS3(provider.profile_image);
        }
        if (payload.address_document && provider.address_document) {
            deleteFileFromS3(provider.address_document);
        }
        return result;
    }
};
// all cron jobs for users

cron.schedule('*/2 * * * *', async () => {
    try {
        const now = new Date();

        const expiredUsers = await User.find({
            isVerified: false,
            codeExpireIn: { $lte: now },
        });

        if (expiredUsers.length > 0) {
            const expiredUserIds = expiredUsers.map((user) => user._id);

            // Delete corresponding Customer documents
            const CustomerDeleteResult = await Customer.deleteMany({
                user: { $in: expiredUserIds },
            });
            const ProviderDeleteResult = await Provider.deleteMany({
                user: { $in: expiredUserIds },
            });

            // Delete the expired User documents
            const userDeleteResult = await User.deleteMany({
                _id: { $in: expiredUserIds },
            });

            console.log(
                `Deleted ${userDeleteResult.deletedCount} expired inactive users`
            );
            console.log(
                `Deleted ${CustomerDeleteResult.deletedCount} associated Customer documents`
            );
            console.log(
                `Deleted ${ProviderDeleteResult.deletedCount} associated Customer documents`
            );
        }
    } catch (error) {
        console.log('Error deleting expired users and associated data:', error);
    }
});

const changeUserStatus = async (id: string) => {
    const user = await User.findById(id);
    if (!user) {
        throw new AppError(httpStatus.NOT_FOUND, 'User not found');
    }
    const result = await User.findByIdAndUpdate(
        id,
        { isBlocked: !user.isBlocked },
        { new: true, runValidators: true }
    );
    return result;
};

const adminVerifyUserFromDB = async (id: string) => {
    const user = await User.findById(id);
    if (!user) {
        throw new AppError(httpStatus.NOT_FOUND, 'User not found');
    }
    const result = await User.findByIdAndUpdate(
        id,
        { isAdminVerified: true },
        { new: true, runValidators: true }
    );
    return result;
};

const userServices = {
    registerCustomer,
    verifyCode,
    resendVerifyCode,
    getMyProfile,
    changeUserStatus,
    deleteUserAccount,
    updateUserProfile,
    adminVerifyUserFromDB,
};

export default userServices;

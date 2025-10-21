/* eslint-disable @typescript-eslint/no-explicit-any */
import httpStatus from 'http-status';
import { JwtPayload } from 'jsonwebtoken';
import AppError from '../../error/appError';
import { deleteFileFromS3 } from '../../helper/deleteFromS3';
import { Provider } from '../provider/provider.model';
import SuperAdmin from '../superAdmin/superAdmin.model';
import { USER_ROLE } from '../user/user.constant';
import { Customer } from './customer.model';

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

const CustomerServices = {
    updateUserProfile,
};

export default CustomerServices;

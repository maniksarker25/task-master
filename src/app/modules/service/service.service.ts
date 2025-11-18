/* eslint-disable @typescript-eslint/no-explicit-any */
import httpStatus from 'http-status';
import mongoose from 'mongoose';
import AppError from '../../error/appError';
import { deleteFileFromS3 } from '../../helper/deleteFromS3';
import { IService } from './service.interface';
import {
    default as ServiceModel,
    default as serviceModel,
} from './service.model';

const createServiceIntoDB = async (userId: string, payload: IService) => {
    const isExist = await ServiceModel.findOne({ provider: userId });
    if (isExist) {
        throw new AppError(
            httpStatus.BAD_GATEWAY,
            'You already have a service'
        );
    }
    const result = await serviceModel.create({ ...payload, provider: userId });
    return result;
};

const getAllServiceFromDB = async (query: Record<string, unknown>) => {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 10;
    const skip = (page - 1) * limit;
    const searchTerm = query.searchTerm || '';

    const filters: any = {};

    Object.keys(query).forEach((key) => {
        if (
            !['searchTerm', 'page', 'limit', 'sortBy', 'sortOrder'].includes(
                key
            )
        ) {
            filters[key] = query[key];
        }
    });
    if (query.category) {
        filters.category = new mongoose.Types.ObjectId(
            query.category as string
        );
    }

    const searchMatchStage = searchTerm
        ? {
              $or: [
                  { title: { $regex: searchTerm, $options: 'i' } },
                  { description: { $regex: searchTerm, $options: 'i' } },
              ],
          }
        : {};

    const pipeline: any[] = [
        {
            $match: { ...filters, ...searchMatchStage },
        },
        {
            $lookup: {
                from: 'feedbacks',
                localField: 'provider',
                foreignField: 'provider',
                as: 'feedbacks',
            },
        },

        {
            $addFields: {
                averageRating: {
                    $cond: {
                        if: { $gt: [{ $size: '$feedbacks' }, 0] },
                        then: { $avg: '$feedbacks.rating' },
                        else: 0,
                    },
                },
            },
        },
        {
            $project: {
                feedbacks: 0,
            },
        },
        { $sort: { createdAt: -1 } },
        {
            $facet: {
                result: [{ $skip: skip }, { $limit: limit }],
                totalCount: [{ $count: 'total' }],
            },
        },
    ];

    const aggResult = await ServiceModel.aggregate(pipeline);
    const result = aggResult[0]?.result || [];
    const total = aggResult[0]?.totalCount[0]?.total || 0;
    const totalPage = Math.ceil(total / limit);

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
const getMyService = async (userId: string) => {
    const service = await ServiceModel.aggregate([
        {
            $match: {
                provider: new mongoose.Types.ObjectId(userId),
            },
        },

        {
            $lookup: {
                from: 'categories',
                localField: 'category',
                foreignField: '_id',
                as: 'category',
            },
        },
        {
            $addFields: {
                category: { $arrayElemAt: ['$category', 0] },
            },
        },

        {
            $lookup: {
                from: 'feedbacks',
                localField: 'provider',
                foreignField: 'provider',
                as: 'feedbacks',
            },
        },
        {
            $addFields: {
                averageRating: {
                    $cond: [
                        { $gt: [{ $size: '$feedbacks' }, 0] },
                        { $avg: '$feedbacks.rating' },
                        0,
                    ],
                },
            },
        },
        {
            $project: {
                feedbacks: 0,
            },
        },
    ]);

    return service[0] || [];
};

const deleteServiceFromDB = async (profileId: string, serviceId: string) => {
    const service = await serviceModel.findOne({
        _id: serviceId,
        provider: profileId,
    });

    if (!service) {
        throw new AppError(httpStatus.NOT_FOUND, 'Service not found');
    }

    if (service.images && service.images.length > 0) {
        for (const imageUrl of service.images) {
            try {
                await deleteFileFromS3(imageUrl);
            } catch (error) {
                console.error(
                    `Failed to delete image from S3: ${imageUrl}`,
                    error
                );
            }
        }
    }

    await serviceModel.findByIdAndDelete(serviceId);

    return {
        message: 'Service and associated images deleted successfully',
        deletedServiceId: serviceId,
    };
};
const toggleServiceActiveStatusFromDB = async (
    profileId: string,
    serviceId: string
) => {
    const service = await serviceModel.findOne({
        _id: serviceId,
        provider: profileId,
    });

    if (!service) {
        throw new AppError(httpStatus.NOT_FOUND, 'Service not found');
    }

    service.isActive = !service.isActive;
    await service.save();

    return service;
};
const getSingleServiceFromDB = async (serviceId: string) => {
    const service = await serviceModel.findById(serviceId);
    if (!service) {
        throw new AppError(httpStatus.NOT_FOUND, 'Service Not Found');
    }

    return service;
};
const updateServiceFromDB = async (profileId: string, payload: any) => {
    const service = await serviceModel.findOne({ provider: profileId });
    if (!service) {
        throw new AppError(httpStatus.NOT_FOUND, 'Service Not Found');
    }

    if (payload.newImages && payload.newImages.length > 0) {
        payload.images = [...service.images, ...payload.newImages];
    } else {
        payload.images = [...service.images];
    }
    if (payload?.deletedImages) {
        payload.images = payload.images.filter(
            (url: any) => !payload?.deletedImages?.includes(url)
        );
    }
    const result = await ServiceModel.findOneAndUpdate(
        { provider: profileId },
        payload,
        { new: true, runValidators: true }
    );
    if (payload.deletedImages) {
        for (const image of payload.deletedImages) {
            deleteFileFromS3(image);
        }
    }
    return result;
};

const ServiceServices = {
    createServiceIntoDB,
    getAllServiceFromDB,
    deleteServiceFromDB,
    getSingleServiceFromDB,
    updateServiceFromDB,
    toggleServiceActiveStatusFromDB,
    getMyService,
};
export default ServiceServices;

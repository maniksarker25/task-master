/* eslint-disable @typescript-eslint/no-explicit-any */
import httpStatus from 'http-status';
import mongoose from 'mongoose';
import AppError from '../../error/appError';
import TaskModel from '../task/task.model';
import { IBid } from './bid.interface';
import BidModel from './bid.model';

const createBidIntoDB = async (userId: string, payload: IBid) => {
    const task = await TaskModel.findById(payload.task);
    if (!task) {
        throw new AppError(httpStatus.NOT_FOUND, 'Task not found');
    }
    const result = (
        await BidModel.create({ ...payload, provider: userId })
    ).populate('provider task');

    return result;
};

const getAllBidFromDB = async () => {
    const result = await BidModel.find({});
    return result;
};

const getBidsByTaskIDFromDB = async (
    taskId: string,
    query: Record<string, unknown>
) => {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 10;
    const skip = (page - 1) * limit;

    const sortBy = query.sortBy || 'createdAt';
    const sortOrder = query.sortOrder === 'asc' ? 1 : -1;

    const pipeline: any[] = [
        {
            $match: {
                task: new mongoose.Types.ObjectId(taskId),
            },
        },

        {
            $lookup: {
                from: 'providers',
                localField: 'provider',
                foreignField: '_id',
                as: 'provider',
            },
        },
        { $unwind: '$provider' },

        {
            $lookup: {
                from: 'feedbacks',
                let: { providerId: '$provider._id' },
                pipeline: [
                    {
                        $match: {
                            $expr: { $eq: ['$provider', '$$providerId'] },
                        },
                    },
                    {
                        $group: {
                            _id: null,
                            totalRatingCount: { $sum: 1 },
                            avgRating: { $avg: '$rating' },
                        },
                    },
                ],
                as: 'ratingStats',
            },
        },

        {
            $addFields: {
                'provider.totalRatingCount': {
                    $ifNull: [
                        { $arrayElemAt: ['$ratingStats.totalRatingCount', 0] },
                        0,
                    ],
                },
                'provider.avgRating': {
                    $ifNull: [
                        { $arrayElemAt: ['$ratingStats.avgRating', 0] },
                        0,
                    ],
                },
            },
        },

        {
            $project: {
                _id: 1,
                price: 1,
                details: 1,
                task: 1,
                createdAt: 1,
                updatedAt: 1,

                provider: {
                    _id: '$provider._id',
                    name: '$provider.name',
                    profile_image: '$provider.profile_image',
                    totalRatingCount: '$provider.totalRatingCount',
                    avgRating: '$provider.avgRating',
                },
            },
        },

        { $sort: { [sortBy]: sortOrder } },

        {
            $facet: {
                result: [{ $skip: skip }, { $limit: limit }],
                totalCount: [{ $count: 'total' }],
            },
        },
    ];

    const aggResult = await BidModel.aggregate(pipeline);

    const result = aggResult[0]?.result || [];
    const total = aggResult[0]?.totalCount[0]?.total || 0;

    return {
        meta: {
            page,
            limit,
            total,
            totalPage: Math.ceil(total / limit),
        },
        result,
    };
};

const deleteBidFromDB = async (id: string, profileId: string) => {
    const result = await BidModel.findOneAndDelete({
        _id: id,
        provider: profileId,
    });
    if (!result) {
        throw new AppError(httpStatus.NOT_FOUND, 'Bid not found');
    }
    return result;
};
const BidServices = {
    createBidIntoDB,
    getAllBidFromDB,
    deleteBidFromDB,
    getBidsByTaskIDFromDB,
};
export default BidServices;

/* eslint-disable @typescript-eslint/no-explicit-any */
import { IService } from './service.interface';
import {
    default as ServiceModel,
    default as serviceModel,
} from './service.model';

const createServiceIntoDB = async (userId: string, payload: IService) => {
    const result = serviceModel.create({ ...payload, provider: userId });
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

const ServiceServices = { createServiceIntoDB, getAllServiceFromDB };
export default ServiceServices;

/* eslint-disable @typescript-eslint/no-explicit-any */
import httpStatus from 'http-status';
import AppError from '../../error/appError';
import { ENUM_TASK_STATUS } from '../task/task.enum';
import { IProvider } from './provider.interface';
import { Provider } from './provider.model';
import TaskModel from '../task/task.model';
import { Types } from 'mongoose';
import BidModel from '../bid/bid.model';

const updateProviderFromDB = async (
    id: string,
    payload: Partial<IProvider>
) => {
    const result = await Provider.findByIdAndUpdate(
        id,
        { $set: payload },
        {
            new: true,
            runValidators: true,
        }
    );

    if (!result) {
        throw new AppError(httpStatus.NOT_FOUND, 'Provider not found');
    }

    return result;
};

const getAllProviderFromDB = async (query: Record<string, unknown>) => {
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
                  { name: { $regex: searchTerm, $options: 'i' } },
                  { email: { $regex: searchTerm, $options: 'i' } },
                  { phone: { $regex: searchTerm, $options: 'i' } },
              ],
          }
        : {};

    const provider = await Provider.aggregate([
        {
            $match: {
                ...searchMatchStage,
                ...filters,
            },
        },
        {
            $lookup: {
                from: 'users',
                localField: 'user',
                foreignField: '_id',
                as: 'user',
                pipeline: [{ $project: { isBlocked: 1, isAdminVerified: 1 } }],
            },
        },
        {
            $addFields: {
                user: { $arrayElemAt: ['$user', 0] },
            },
        },
        {
            $lookup: {
                from: 'tasks',
                localField: '_id',
                foreignField: 'provider',
                as: 'activeTasks',
                pipeline: [
                    {
                        $match: {
                            status: {
                                $in: [
                                    ENUM_TASK_STATUS.IN_PROGRESS,
                                    ENUM_TASK_STATUS.OPEN_FOR_BID,
                                ],
                            },
                        },
                    },
                ],
            },
        },
        {
            $addFields: {
                totalTaskCount: { $size: '$activeTasks' },
            },
        },
        {
            $project: { activeTasks: 0 },
        },
        {
            $facet: {
                result: [{ $skip: skip }, { $limit: limit }],
                totalCount: [{ $count: 'total' }],
            },
        },
    ]);

    const result = provider[0]?.result || [];
    const total = provider[0]?.totalCount[0]?.total || 0;
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

const getSingleProvider = async (id: string) => {
    const result = await Provider.findById(id).populate({
        path: 'user',
        select: 'isBlocked isAdminVerified',
    });
    return result;
};

const getProviderMetaDataFromDB = async (profileId: string) => {
    // -------- 1) TASK META COUNT --------
    const result = await TaskModel.aggregate([
        {
            $match: {
                provider: new Types.ObjectId(profileId),
            },
        },
        {
            $group: {
                _id: '$status',
                count: { $sum: 1 },
            },
        },
    ]);

    const meta = {
        completedCount: 0,
        inProgressCount: 0,
        pendingCount: 0,
    };

    result.forEach((item) => {
        if (item._id === ENUM_TASK_STATUS.COMPLETED)
            meta.completedCount = item.count;

        if (item._id === ENUM_TASK_STATUS.IN_PROGRESS)
            meta.inProgressCount = item.count;

        if (item._id === ENUM_TASK_STATUS.OPEN_FOR_BID)
            meta.pendingCount = item.count;
    });

    // -------- 2) FIND TASKS WHERE PROVIDER BIDDED & TASK IS OPEN_FOR_BID --------
    const myBids = await BidModel.find({ provider: profileId }).populate(
        'task'
    );

    // Filter only those bids where task.status === OPEN_FOR_BID
    const openForBidTasks = myBids.filter(
        (bid) => bid.task && bid.task.status === ENUM_TASK_STATUS.OPEN_FOR_BID
    );

    const bidOpenForBidCount = openForBidTasks.length;

    return {
        ...meta,
        bidOpenForBidCount,
    };
};

const ProviderServices = {
    updateProviderFromDB,
    getAllProviderFromDB,
    getSingleProvider,
    getProviderMetaDataFromDB,
};
export default ProviderServices;

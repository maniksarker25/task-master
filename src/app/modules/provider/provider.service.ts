import httpStatus from 'http-status';
import AppError from '../../error/appError';
import { IProvider } from './provider.interface';
import { Provider } from './provider.model';
import { ENUM_TASK_STATUS } from '../task/task.enum';

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

const ProviderServices = {
    updateProviderFromDB,
    getAllProviderFromDB,
};
export default ProviderServices;
//  test

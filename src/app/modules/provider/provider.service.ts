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

const getAllProviderFromDB = async (pageNum: string | number) => {
    const limit = 10;
    const skip = (Number(pageNum) - 1) * limit;
    const provider = await Provider.aggregate([
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
        { $skip: skip },
        { $limit: limit },
    ]);
    return provider;
};

const ProviderServices = {
    updateProviderFromDB,
    getAllProviderFromDB,
};
export default ProviderServices;
//  test

import Payment from './payment.model';

/* eslint-disable @typescript-eslint/no-explicit-any */
const getAllPayments = async (query: Record<string, unknown>) => {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 10;
    const skip = (page - 1) * limit;
    const searchTerm = query.searchTerm || '';
    const filters: Record<string, any> = {};

    Object.keys(query).forEach((key) => {
        if (
            ![
                'searchTerm',
                'page',
                'limit',
                'sortBy',
                'sortOrder',
                'minPrice',
                'maxPrice',
            ].includes(key)
        ) {
            filters[key] = query[key];
        }
    });

    // Sorting
    const sortBy: any = query.sortBy || 'createdAt';
    const sortOrder = query.sortOrder === 'asc' ? 1 : -1;
    const sortStage = { [sortBy]: sortOrder };

    const searchMatchStage = searchTerm
        ? {
              $or: [{ _id: { $regex: searchTerm, $options: 'i' } }],
          }
        : {};
    const pipeline: any[] = [
        { $match: { ...filters, ...searchMatchStage } },
        {
            $lookup: {
                from: 'tasks',
                localField: 'task',
                foreignField: '_id',
                as: 'task',
                pipeline: [
                    {
                        $project: {
                            title: 1,
                        },
                    },
                ],
            },
        },
        { $unwind: { path: '$task', preserveNullAndEmptyArrays: true } },

        {
            $lookup: {
                from: 'providers',
                localField: 'provider',
                foreignField: '_id',
                as: 'provider',
                pipeline: [
                    {
                        $project: {
                            _id: 1,
                            name: 1,
                            profile_image: 1,
                            bankName: 1,
                            bankAccountNumber: 1,
                        },
                    },
                ],
            },
        },
        { $unwind: { path: '$provider', preserveNullAndEmptyArrays: true } },
        { $sort: sortStage },
        {
            $facet: {
                result: [{ $skip: skip }, { $limit: limit }],
                totalCount: [{ $count: 'total' }],
            },
        },
    ];

    const aggResult = await Payment.aggregate(pipeline);
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

const PaymentServices = { getAllPayments };
export default PaymentServices;

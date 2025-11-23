/* eslint-disable @typescript-eslint/no-explicit-any */
import mongoose from 'mongoose';
import Message from './message.model';

const getMessages = async (
    profileId: string,
    query: Record<string, unknown>
) => {
    const conversationId = query.conversationId as string;
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 10;
    const skip = (page - 1) * limit;
    const searchTerm = (query?.searchTerm as string) || '';

    const messages = await Message.aggregate([
        {
            $match: {
                conversationId: new mongoose.Types.ObjectId(conversationId),
                text: { $regex: searchTerm, $options: 'i' },
            },
        },
        {
            $lookup: {
                from: 'customers',
                localField: 'msgByUserId',
                foreignField: '_id',
                as: 'customerDetails',
            },
        },
        {
            $lookup: {
                from: 'providers',
                localField: 'msgByUserId',
                foreignField: '_id',
                as: 'providerDetails',
            },
        },
        {
            $addFields: {
                userDetails: {
                    $cond: [
                        { $gt: [{ $size: '$customerDetails' }, 0] },
                        { $arrayElemAt: ['$customerDetails', 0] },
                        { $arrayElemAt: ['$providerDetails', 0] },
                    ],
                },
                isMyMessage: {
                    $eq: [
                        '$msgByUserId',
                        new mongoose.Types.ObjectId(profileId),
                    ],
                },
            },
        },
        {
            $project: {
                text: 1,
                imageUrl: 1,
                videoUrl: 1,
                pdfUrl: 1,
                seen: 1,
                msgByUserId: 1,
                conversationId: 1,
                createdAt: 1,
                updatedAt: 1,
                'userDetails.name': 1,
                'userDetails.profile_image': 1,
                isMyMessage: 1,
            },
        },
        { $sort: { createdAt: -1 } },
        {
            $facet: {
                result: [{ $skip: skip }, { $limit: limit }],
                totalCount: [{ $count: 'total' }],
            },
        },
    ]);

    const result = messages[0]?.result || [];
    const total = messages[0]?.totalCount[0]?.total || 0;
    const totalPages = Math.ceil(total / limit);

    return {
        meta: { page, limit, total, totalPages },
        result,
    };
};

const MessageService = { getMessages };
export default MessageService;

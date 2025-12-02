/* eslint-disable @typescript-eslint/no-explicit-any */
import httpStatus from 'http-status';
import AppError from '../../error/appError';
import { ITask } from './task.interface';

import axios from 'axios';
import { JwtPayload } from 'jsonwebtoken';
import mongoose from 'mongoose';
import config from '../../config';
import { payStackBaseUrl, platformChargePercentage } from '../../constant';
import { sendBatchPushNotification } from '../../helper/sendPushNotification';
import { ENUM_PAYMENT_PURPOSE } from '../../utilities/enum';
import bidModel from '../bid/bid.model';
import { ENUM_NOTIFICATION_TYPE } from '../notification/notification.enum';
import Notification from '../notification/notification.model';
import Payment from '../payment/payment.model';
import QuestionModel from '../question/question.model';
import { ENUM_REFERRAL_USE_STATUS } from '../referralUse/referralUse.enum';
import ReferralUseModel from '../referralUse/referralUse.model';
import { USER_ROLE } from '../user/user.constant';
import { User } from '../user/user.model';
import { ENUM_TASK_STATUS } from './task.enum';
import TaskModel from './task.model';

const createTaskIntoDB = async (profileId: string, payload: Partial<ITask>) => {
    try {
        const createdTask = await TaskModel.create({
            ...payload,
            customer: profileId,
        });

        const result = await TaskModel.findById(createdTask._id).populate(
            'category'
        );

        const admins = await User.find({ role: USER_ROLE.admin }).select(
            '_id profileId'
        );

        if (admins.length > 0) {
            const title = 'New Task Created';
            const message = `A new task "${payload.title}" has been created`;

            await Notification.create({
                title,
                message,
                receiver: USER_ROLE.admin,
                type: ENUM_NOTIFICATION_TYPE.TASK_CREATED,
                redirectLink: `${createdTask?._id}`,
            });

            const adminUserIds = admins.map((admin) => admin._id.toString());
            await sendBatchPushNotification(adminUserIds, title, message, {
                taskId: result?._id.toString(),
                type: ENUM_NOTIFICATION_TYPE.TASK_CREATED,
            });
        }

        return result;
    } catch (err) {
        console.error('Failed to send task create admin notification:', err);
        throw err;
    }
};

const getAllTaskFromDB = async (query: Record<string, any>) => {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 10;
    const skip = (page - 1) * limit;
    const searchTerm = query.searchTerm || '';
    const maxDistance = Number(query.maxDistance) * 1000 || 5000;
    const minPrice = Number(query.minPrice) || null;
    const maxPrice = Number(query.maxPrice) || null;
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

    if (query.category) {
        filters.category = new mongoose.Types.ObjectId(query.category);
    }

    const searchMatchStage = searchTerm
        ? {
              $or: [
                  { title: { $regex: searchTerm, $options: 'i' } },
                  { description: { $regex: searchTerm, $options: 'i' } },
              ],
          }
        : {};

    if (minPrice !== null || maxPrice !== null) {
        filters.budget = {};
        if (minPrice !== null) filters.budget.$gte = minPrice;
        if (maxPrice !== null) filters.budget.$lte = maxPrice;
    }

    // Sorting
    const sortBy = query.sortBy || 'createdAt';
    const sortOrder = query.sortOrder === 'asc' ? 1 : -1;
    const sortStage = { [sortBy]: sortOrder };

    const pipeline: any[] = [
        { $match: { ...filters, ...searchMatchStage, isDeleted: false } },
        {
            $lookup: {
                from: 'bids',
                localField: '_id',
                foreignField: 'task',
                as: 'bids',
            },
        },
        {
            $addFields: {
                totalOffer: { $size: '$bids' },
            },
        },

        {
            $lookup: {
                from: 'customers',
                localField: 'customer',
                foreignField: '_id',
                as: 'customer',
                pipeline: [
                    {
                        $project: {
                            _id: 1,
                            name: 1,
                            profile_image: 1,
                        },
                    },
                ],
            },
        },
        { $unwind: { path: '$customer', preserveNullAndEmptyArrays: true } },
        {
            $lookup: {
                from: 'categories',
                localField: 'category',
                foreignField: '_id',
                as: 'category',
                pipeline: [
                    {
                        $project: {
                            _id: 1,
                            name: 1,
                        },
                    },
                ],
            },
        },
        {
            $unwind: { path: '$category', preserveNullAndEmptyArrays: true },
        },
        {
            $project: {
                bids: 0,
            },
        },
        { $sort: sortStage },
        {
            $facet: {
                result: [{ $skip: skip }, { $limit: limit }],
                totalCount: [{ $count: 'total' }],
            },
        },
    ];

    // 🗺️ Geo filter (if user sends coordinates)
    if (query.latitude && query.longitude) {
        pipeline.unshift({
            $geoNear: {
                near: {
                    type: 'Point',
                    coordinates: [
                        parseFloat(query.longitude as string),
                        parseFloat(query.latitude as string),
                    ],
                },
                distanceField: 'distance',
                maxDistance: maxDistance,
                spherical: true,
            },
        });
        pipeline.push({
            $sort: { distance: 1 },
        });
    }

    const aggResult = await TaskModel.aggregate(pipeline);
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
const getMyTaskFromDB = async (
    userData: JwtPayload,
    query: Record<string, any>
) => {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 10;
    const skip = (page - 1) * limit;
    const searchTerm = query.searchTerm || '';
    const minPrice = Number(query.minPrice) || null;
    const maxPrice = Number(query.maxPrice) || null;
    const matchStage: any = {};
    if (userData.role == USER_ROLE.customer) {
        matchStage.customer = new mongoose.Types.ObjectId(userData.profileId);
    }
    if (
        query.status != ENUM_TASK_STATUS.OPEN_FOR_BID &&
        query.status != 'bidMade' &&
        userData.role == USER_ROLE.provider
    ) {
        matchStage.provider = new mongoose.Types.ObjectId(userData.profileId);
    }

    const filters: Record<string, any> = {};
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
        filters.category = new mongoose.Types.ObjectId(query.category);
    }

    const searchMatchStage = searchTerm
        ? {
              $or: [
                  { title: { $regex: searchTerm, $options: 'i' } },
                  { description: { $regex: searchTerm, $options: 'i' } },
              ],
          }
        : {};

    if (minPrice !== null || maxPrice !== null) {
        filters.budget = {};
        if (minPrice !== null) filters.budget.$gte = minPrice;
        if (maxPrice !== null) filters.budget.$lte = maxPrice;
    }
    if (userData.role === USER_ROLE.provider) {
        if (query.status === 'bidMade') {
            // Do NOT put inside filters!
            delete filters.status;
        }

        if (query.status === 'bidReceived') {
            filters.status = ENUM_TASK_STATUS.OPEN_FOR_BID;
        }
    }

    // Sorting
    const sortBy = query.sortBy || 'createdAt';
    const sortOrder = query.sortOrder === 'asc' ? 1 : -1;
    const sortStage = { [sortBy]: sortOrder };

    const pipeline: any[] = [
        {
            $match: {
                ...matchStage,
                ...filters,
                ...searchMatchStage,
                isDeleted: false,
            },
        },
        {
            $lookup: {
                from: 'bids',
                localField: '_id',
                foreignField: 'task',
                as: 'bids',
            },
        },
        // Apply "bidMade" filter here
        ...(query.status === 'bidMade'
            ? [
                  {
                      $match: {
                          'bids.provider': new mongoose.Types.ObjectId(
                              userData.profileId
                          ),
                      },
                  },
              ]
            : []),

        {
            $addFields: {
                totalOffer: { $size: '$bids' },
            },
        },
        {
            $lookup: {
                from: 'customers',
                localField: 'customer',
                foreignField: '_id',
                as: 'customer',
                pipeline: [
                    {
                        $project: {
                            _id: 1,
                            name: 1,
                            profile_image: 1,
                        },
                    },
                ],
            },
        },
        { $unwind: { path: '$customer', preserveNullAndEmptyArrays: true } },
        {
            $lookup: {
                from: 'categories',
                localField: 'category',
                foreignField: '_id',
                as: 'category',
                pipeline: [
                    {
                        $project: {
                            _id: 1,
                            name: 1,
                        },
                    },
                ],
            },
        },
        {
            $unwind: { path: '$category', preserveNullAndEmptyArrays: true },
        },
        {
            $project: {
                bids: 0,
            },
        },
        { $sort: sortStage },
        {
            $facet: {
                result: [{ $skip: skip }, { $limit: limit }],
                totalCount: [{ $count: 'total' }],
            },
        },
    ];

    const aggResult = await TaskModel.aggregate(pipeline);
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
const getSingleTaskFromDB = async (userId: string, id: string) => {
    const pipeline: any[] = [
        {
            $match: {
                _id: new mongoose.Types.ObjectId(id),
                isDeleted: false,
            },
        },
        {
            $lookup: {
                from: 'bids',
                localField: '_id',
                foreignField: 'task',
                as: 'bids',
            },
        },
        {
            $addFields: {
                totalOffer: { $size: '$bids' },
            },
        },
        {
            $lookup: {
                from: 'bids',
                let: { taskId: '$_id' },
                pipeline: [
                    {
                        $match: {
                            $expr: {
                                $and: [
                                    { $eq: ['$task', '$$taskId'] },
                                    {
                                        $eq: [
                                            '$provider',
                                            new mongoose.Types.ObjectId(userId),
                                        ],
                                    },
                                ],
                            },
                        },
                    },
                    { $project: { _id: 1 } },
                ],
                as: 'userBid',
            },
        },
        {
            $addFields: {
                isBid: { $gt: [{ $size: '$userBid' }, 0] },
            },
        },
        {
            $lookup: {
                from: 'customers',
                localField: 'customer',
                foreignField: '_id',
                as: 'customer',
                pipeline: [
                    {
                        $project: {
                            _id: 1,
                            name: 1,
                            profile_image: 1,
                            email: 1,
                        },
                    },
                ],
            },
        },
        { $unwind: { path: '$customer', preserveNullAndEmptyArrays: true } },
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
                            email: 1,
                        },
                    },
                ],
            },
        },
        { $unwind: { path: '$provider', preserveNullAndEmptyArrays: true } },
        {
            $lookup: {
                from: 'categories',
                localField: 'category',
                foreignField: '_id',
                as: 'category',
                pipeline: [
                    {
                        $project: {
                            _id: 1,
                            name: 1,
                        },
                    },
                ],
            },
        },
        {
            $unwind: { path: '$category', preserveNullAndEmptyArrays: true },
        },
        {
            $project: {
                bids: 0,
                userBid: 0,
            },
        },
    ];

    const result = await TaskModel.aggregate(pipeline);
    return result[0] || null;
};

const deleteTaskFromDB = async (id: string, currentUserId: string) => {
    const taskData = await TaskModel.findOne({
        _id: id,
        customer: currentUserId,
    });

    if (!taskData) {
        throw new AppError(httpStatus.NOT_FOUND, 'Task not found');
    }

    await Promise.all([
        bidModel.deleteMany({ task: taskData._id }),
        QuestionModel.deleteMany({ task: taskData._id }),
        TaskModel.findByIdAndDelete(id),
    ]);

    return taskData;
};

const acceptOfferByProvider = async (taskId: string, currentUserId: string) => {
    const task = await TaskModel.findById(taskId);

    if (!task) {
        throw new AppError(httpStatus.NOT_FOUND, 'Task not found');
    }

    if (task.provider?.toString() !== currentUserId) {
        throw new AppError(
            httpStatus.UNAUTHORIZED,
            'You are not authorized to accept this task'
        );
    }
    if (
        task.status === ENUM_TASK_STATUS.IN_PROGRESS ||
        task.status === ENUM_TASK_STATUS.COMPLETED
    ) {
        throw new AppError(
            httpStatus.BAD_REQUEST,
            `Task is already ${task.status.toLowerCase()}`
        );
    }

    task.status = ENUM_TASK_STATUS.IN_PROGRESS;

    await task.save();

    return task;
};

const acceptTaskByCustomerFromDB = async (profileID: string, bidID: string) => {
    const bidData: any = await bidModel.findById(bidID);
    if (!bidData) {
        throw new AppError(httpStatus.NOT_FOUND, 'Bid not found');
    }
    const taskData: any = await TaskModel.findById(bidData.task).populate({
        path: 'customer',
        select: 'email',
    });
    if (taskData?.customer?._id.toString() !== profileID) {
        throw new AppError(
            httpStatus.UNAUTHORIZED,
            'You are not authorized to accept this task'
        );
    }
    const amount = bidData.price * 100; // in kobo
    // --- Initialize Pay-stack transaction ---
    const headers = {
        Authorization: `Bearer ${config.payStack.secretKey}`,
        'Content-Type': 'application/json',
    };
    const response: any = await axios.post(
        `${payStackBaseUrl}/transaction/initialize`,
        {
            email: taskData.customer.email,
            amount,
            // subaccount: partner.payStackSubAccountId,
            metadata: {
                taskId: bidData.task.toString(),
                bidId: bidData._id.toString(),
                customerId: profileID,
                providerId: bidData.provider.toString(),
                paymentPurpose: ENUM_PAYMENT_PURPOSE.BID_ACCEPT,
            },
            callback_url: `http://10.10.20.48:3000/success`,
        },
        {
            headers,
        }
    );
    const data = response.data.data;
    return {
        paymentLink: data.authorization_url,
        accessCode: data.access_code,
        reference: data.reference,
    };
};

const completeTaskByCustomer = async (
    taskId: string,
    currentUserId: string
) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        //  GET TASK & VALIDATION
        const task = await TaskModel.findById(taskId).session(session);
        if (!task) {
            throw new AppError(httpStatus.NOT_FOUND, 'Task not found');
        }

        if (task.customer?.toString() !== currentUserId) {
            throw new AppError(
                httpStatus.UNAUTHORIZED,
                'You are not authorized to complete this task'
            );
        }

        //  HANDLE REFERRAL BONUS (Includes rollback)
        const referralUse = await ReferralUseModel.findOneAndUpdate(
            {
                referred: task.provider,
                status: ENUM_REFERRAL_USE_STATUS.ACTIVE,
            },
            { status: ENUM_REFERRAL_USE_STATUS.USED },
            {
                new: true,
                sort: { createdAt: 1 },
                runValidators: true,
                session,
            }
        );

        const platformCharge =
            task.acceptedBidAmount * platformChargePercentage;
        const earning = referralUse
            ? (task.acceptedBidAmount ?? 0) + referralUse.value
            : task.acceptedBidAmount ?? 0;
        const providerEarning = earning - platformCharge;
        //  UPDATE TASK STATUS + PROVIDER EARNING
        const updatedTask = await TaskModel.findByIdAndUpdate(
            taskId,
            {
                status: ENUM_TASK_STATUS.COMPLETED,
                providerEarningAmount: providerEarning,
                $push: {
                    statusWithDate: {
                        status: ENUM_TASK_STATUS.COMPLETED,
                        date: new Date(),
                    },
                },
            },
            {
                new: true,
                runValidators: true,
                session,
            }
        );

        // CREATE PAYMENT
        await Payment.create(
            [
                {
                    provider: task.provider,
                    task: task._id,
                    amount: providerEarning,
                },
            ],
            { session }
        );

        // SAVE NOTIFICATION (In transaction)
        const title = 'Task Completed';
        const message = `Task "${task.title}" has been completed`;
        const redirectLink = `${task._id}`;

        await Notification.create(
            [
                {
                    title,
                    message,
                    receiver: USER_ROLE.admin,
                    type: ENUM_NOTIFICATION_TYPE.TASK_COMPLETED,
                    redirectLink,
                },
            ],
            { session }
        );

        // COMMIT TRANSACTION
        await session.commitTransaction();
        session.endSession();

        //PUSH NOTIFICATION (OUTSIDE TRANSACTION)
        const admins = await User.find({ role: USER_ROLE.admin }).select('_id');

        if (admins.length > 0) {
            const adminUserIds = admins.map((a) => a._id.toString());

            await sendBatchPushNotification(adminUserIds, title, message, {
                type: ENUM_NOTIFICATION_TYPE.TASK_COMPLETED,
                taskId: task._id.toString(),
            });
        }

        return updatedTask;
    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        throw error;
    }
};

const TaskServices = {
    createTaskIntoDB,
    getAllTaskFromDB,
    getSingleTaskFromDB,
    deleteTaskFromDB,
    getMyTaskFromDB,
    acceptOfferByProvider,
    completeTaskByCustomer,
    acceptTaskByCustomerFromDB,
};
export default TaskServices;

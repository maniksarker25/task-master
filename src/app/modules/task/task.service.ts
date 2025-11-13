/* eslint-disable @typescript-eslint/no-explicit-any */
import httpStatus from 'http-status';
import AppError from '../../error/appError';
import { ITask } from './task.interface';

import { JwtPayload } from 'jsonwebtoken';
import mongoose from 'mongoose';
import bidModel from '../bid/bid.model';
import QuestionModel from '../question/question.model';
import { USER_ROLE } from '../user/user.constant';
import { ENUM_TASK_STATUS } from './task.enum';
import TaskModel from './task.model';

const createTaskIntoDB = async (profileId: string, payload: Partial<ITask>) => {
    const result = (
        await TaskModel.create({ ...payload, customer: profileId })
    ).populate('category');
    return result;
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
    } else {
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
    // Sorting
    const sortBy = query.sortBy || 'createdAt'; // default sorting field
    const sortOrder = query.sortOrder === 'asc' ? 1 : -1; // default descending
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
const getSingleTaskFromDB = async (id: string) => {
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
    ];

    const result = await TaskModel.aggregate(pipeline);
    return result[0] || null;
};

const deleteTaskFromDB = async (id: string, currentUserId: string) => {
    const taskData = await TaskModel.findById(id);

    if (!taskData) {
        throw new AppError(httpStatus.NOT_FOUND, 'Task not found');
    }
    if (taskData.provider?.toString() !== currentUserId) {
        throw new AppError(
            httpStatus.UNAUTHORIZED,
            'You are not authorized to accept this task'
        );
    }

    if (taskData.provider) {
        taskData.isDeleted = true;

        await taskData.save();
    } else {
        await bidModel.deleteMany({ task: taskData._id });
        await QuestionModel.deleteMany({ task: taskData._id });

        await TaskModel.findByIdAndDelete(id);
    }

    return;
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
const completeTaskByCustomer = async (
    taskId: string,
    currentUserId: string
) => {
    const task = await TaskModel.findById(taskId);
    if (!task) {
        throw new AppError(httpStatus.NOT_FOUND, 'Task not found');
    }

    if (task.customer?.toString() !== currentUserId) {
        throw new AppError(
            httpStatus.UNAUTHORIZED,
            'You are not authorized to complete this task'
        );
    }

    task.status = ENUM_TASK_STATUS.COMPLETED;
    await task.save();

    return task;
};

const TaskServices = {
    createTaskIntoDB,
    getAllTaskFromDB,
    getSingleTaskFromDB,
    deleteTaskFromDB,
    getMyTaskFromDB,
    acceptOfferByProvider,
    completeTaskByCustomer,
};
export default TaskServices;

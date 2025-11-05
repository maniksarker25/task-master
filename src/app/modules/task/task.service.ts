/* eslint-disable @typescript-eslint/no-explicit-any */
import httpStatus from 'http-status';
import AppError from '../../error/appError';
import { ITask } from './task.interface';

import mongoose from 'mongoose';
import bidModel from '../bid/bid.model';
import QuestionModel from '../question/question.model';
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

    // Sorting
    const sortBy = query.sortBy || 'createdAt'; // default sorting field
    const sortOrder = query.sortOrder === 'asc' ? 1 : -1; // default descending
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
const getMyTaskFromDB = async (userId: string, query: Record<string, any>) => {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 10;
    const skip = (page - 1) * limit;
    const searchTerm = query.searchTerm || '';

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

    // Sorting
    const sortBy = query.sortBy || 'createdAt'; // default sorting field
    const sortOrder = query.sortOrder === 'asc' ? 1 : -1; // default descending
    const sortStage = { [sortBy]: sortOrder };

    const pipeline: any[] = [
        {
            $match: {
                ...filters,
                ...searchMatchStage,
                isDeleted: false,
                customer: userId,
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
    const result = await TaskModel.findById(id).populate('category provider');
    return result;
};

const deleteTaskFromDB = async (id: string) => {
    const taskData = await TaskModel.findById(id);

    if (!taskData) {
        throw new AppError(httpStatus.NOT_FOUND, 'Task not found');
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
const TaskServices = {
    createTaskIntoDB,
    getAllTaskFromDB,
    getSingleTaskFromDB,
    deleteTaskFromDB,
    getMyTaskFromDB,
};
export default TaskServices;

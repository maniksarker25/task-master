import httpStatus from 'http-status';
import AppError from '../../error/appError';
import { IBid } from './bid.interface';
import BidModel from './bid.model';
import TaskModel from '../task/task.model';

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

const getBidsByTaskIDFromDB = async (taskId: string) => {
    const result = await BidModel.find({ task: taskId });
    return result;
};

const deleteBidFromDB = async (id: string) => {
    const result = await BidModel.findByIdAndDelete(id);
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

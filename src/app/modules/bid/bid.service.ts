import httpStatus from 'http-status';
import AppError from '../../error/appError';
import { IBid } from './bid.interface';
import BidModel from './bid.model';

const createBidIntoDB = async (payload: IBid) => {
    const result = (await BidModel.create(payload)).populate('provider task');

    return result;
};

const getAllBidFromDB = async () => {
    const result = await BidModel.find({});
    return result;
};

const deleteBidFromDB = async (id: string) => {
    const result = await BidModel.findByIdAndDelete(id);
    if (!result) {
        throw new AppError(httpStatus.NOT_FOUND, 'Bid not found');
    }
    return result;
};
const BidServices = { createBidIntoDB, getAllBidFromDB, deleteBidFromDB };
export default BidServices;

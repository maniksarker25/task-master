import httpStatus from 'http-status';
import AppError from '../../error/appError';
import { IBid } from './bid.interface';
import BidModel from './bid.model';

const createBid = async (payload: IBid) => {
    const result = (await BidModel.create(payload)).populate('provider task');

    return result;
};

const getAllBid = async () => {
    const result = await BidModel.find({});
    return result;
};

const deleteBid = async (id: string) => {
    const result = await BidModel.findByIdAndDelete(id);
    if (!result) {
        throw new AppError(httpStatus.NOT_FOUND, 'Bid not found');
    }
    return result;
};
const BidServices = { createBid, getAllBid, deleteBid };
export default BidServices;

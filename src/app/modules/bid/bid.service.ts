import { IBid } from './bid.interface';
import BidModel from './bid.model';

const createBid = async (payload: IBid) => {
    const result = (await BidModel.create(payload)).populate('provider task');

    return result;
};

const getAllBid = async () => {
    const result = await BidModel.find({}).populate('provider task');
    return result;
};

const BidServices = { createBid, getAllBid };
export default BidServices;

import httpStatus from 'http-status';
import catchAsync from '../../utilities/catchasync';
import sendResponse from '../../utilities/sendResponse';
import BidServices from './bid.service';

const createBidIntoDB = catchAsync(async (req, res) => {
    const result = await BidServices.createBid(req.body);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Bid created successfully',
        data: result,
    });
});

const getAllBid = catchAsync(async (req, res) => {
    const result = await BidServices.getAllBid();
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Bids fetched successfully',
        data: result,
    });
});

const BidController = { createBidIntoDB, getAllBid };
export default BidController;

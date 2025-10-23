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

const getAllBidFromDB = catchAsync(async (req, res) => {
    const result = await BidServices.getAllBid();
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Bids fetched successfully',
        data: result,
    });
});
const deleteBidFromDB = catchAsync(async (req, res) => {
    const result = await BidServices.deleteBid(req.params.id);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Bid deleted successfully',
        data: result,
    });
});

const BidController = { createBidIntoDB, getAllBidFromDB, deleteBidFromDB };
export default BidController;

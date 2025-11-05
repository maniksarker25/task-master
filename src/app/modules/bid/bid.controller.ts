import httpStatus from 'http-status';
import catchAsync from '../../utilities/catchasync';
import sendResponse from '../../utilities/sendResponse';
import BidServices from './bid.service';

const createBid = catchAsync(async (req, res) => {
    const result = await BidServices.createBidIntoDB(
        req.user.profileId,
        req.body
    );
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Bid created successfully',
        data: result,
    });
});

const getAllBid = catchAsync(async (req, res) => {
    const result = await BidServices.getAllBidFromDB();
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Bids fetched successfully',
        data: result,
    });
});
// git chages
const deleteBid = catchAsync(async (req, res) => {
    const result = await BidServices.deleteBidFromDB(req.params.id);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Bid deleted successfully',
        data: result,
    });
});

const BidController = { createBid, getAllBid, deleteBid };
export default BidController;

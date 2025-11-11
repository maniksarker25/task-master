import httpStatus from 'http-status';
import catchAsync from '../../utilities/catchasync';
import sendResponse from '../../utilities/sendResponse';
import cancellationRequestServices from './cancellationRequest.service';

const createCancelRequest = catchAsync(async (req, res) => {
    const result =
        await cancellationRequestServices.createCancellationRequestIntoDb(
            req.user.profileId,
            req.body
        );

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Cancel request created successfully',
        data: result,
    });
});

const CancellationRequestController = { createCancelRequest };
export default CancellationRequestController;

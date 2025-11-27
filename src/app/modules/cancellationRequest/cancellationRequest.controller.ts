/* eslint-disable @typescript-eslint/no-explicit-any */
import httpStatus from 'http-status';
import { getCloudFrontUrl } from '../../helper/multer-s3-uploader';
import catchAsync from '../../utilities/catchasync';
import sendResponse from '../../utilities/sendResponse';
import { ENUM_CANCELLATION_REQUEST_STATUS } from './cancellationRequest.enum';
import cancellationRequestServices from './cancellationRequest.service';

const createCancellationRequest = catchAsync(async (req, res) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const file: any = req.files?.reject_evidence;
    if (req.files?.reject_evidence) {
        req.body.reject_evidence = getCloudFrontUrl(file[0].key);
    }
    const result =
        await cancellationRequestServices.createCancellationRequestIntoDb(
            req.user.profileId,
            req.body
        );

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Cancellation request created successfully',
        data: result,
    });
});

const getCancellationRequestByTask = catchAsync(async (req, res) => {
    const result =
        await cancellationRequestServices.getCancellationRequestByTaskFromDB(
            req.user.profileId,
            req.params.taskId as string
        );
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Cancellation request retrieved successfully',
        data: result,
    });
});

const cancelCancellationRequest = catchAsync(async (req, res) => {
    const result =
        await cancellationRequestServices.cancelCancellationRequestByTaskFromDB(
            req.user.profileId,
            req.params.id as string
        );
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Cancellation request deleted successfully',
        data: result,
    });
});

const handleAcceptRejectCancellationRequest = catchAsync(async (req, res) => {
    const { status } = req.body;

    const file: any = req.files?.reject_evidence;
    if (file) {
        req.body.reject_evidence = getCloudFrontUrl(file[0].key);
    }

    const result =
        await cancellationRequestServices.acceptRejectCancellationRequest(
            req.user.profileId,
            req.params.id as string,
            req.body
        );

    let message = 'Cancellation request updated successfully';

    if (status === ENUM_CANCELLATION_REQUEST_STATUS.ACCEPTED) {
        message = 'Cancellation request approved successfully';
    } else if (status === ENUM_CANCELLATION_REQUEST_STATUS.REJECTED) {
        message = 'Cancellation request rejected successfully';
    }

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message,
        data: result,
    });
});

const CancellationRequestController = {
    createCancellationRequest,
    getCancellationRequestByTask,
    cancelCancellationRequest,
    handleAcceptRejectCancellationRequest,
};
export default CancellationRequestController;

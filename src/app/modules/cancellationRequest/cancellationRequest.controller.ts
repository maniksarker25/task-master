import httpStatus from 'http-status';
import catchAsync from '../../utilities/catchasync';
import sendResponse from '../../utilities/sendResponse';
import cancellationRequestServices from './cancellationRequest.service';
import { getCloudFrontUrl } from '../../helper/multer-s3-uploader';

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

const acceptCancellationRequest = catchAsync(async (req, res) => {
    const result =
        await cancellationRequestServices.acceptCancellationRequestFromDB(
            req.user.profileId,
            req.params.id as string
        );
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Cancellation request approved successfully',
        data: result,
    });
});

const rejectCancellationRequest = catchAsync(async (req, res) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const file: any = req.files?.reject_evidence;
    if (req.files?.reject_evidence) {
        req.body.reject_evidence = getCloudFrontUrl(file[0].key);
    }

    const result =
        await cancellationRequestServices.rejectCancellationRequestFromDB(
            req.user.profileId,
            req.params.id as string,
            req.body
        );

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Cancellation request rejected successfully',
        data: result,
    });
});
const CancellationRequestController = {
    createCancellationRequest,
    getCancellationRequestByTask,
    cancelCancellationRequest,
    acceptCancellationRequest,
    rejectCancellationRequest,
};
export default CancellationRequestController;

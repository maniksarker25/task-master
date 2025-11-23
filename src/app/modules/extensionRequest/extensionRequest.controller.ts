import httpStatus from 'http-status';
import { getCloudFrontUrl } from '../../helper/multer-s3-uploader';
import catchAsync from '../../utilities/catchasync';
import sendResponse from '../../utilities/sendResponse';
import extensionRequestServices from './extensionRequest.service';

const createExtensionRequest = catchAsync(async (req, res) => {
    const result = await extensionRequestServices.extensionRequestIntoDb(
        req.user.profileId,
        req.body
    );
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Extension request created successfully',
        data: result,
    });
});
const extensionRequestByTask = catchAsync(async (req, res) => {
    const result =
        await extensionRequestServices.getExtensionRequestByTaskFromDB(
            req.user.profileId,
            req.params.taskId as string
        );
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Extension request Get by Task successfully',
        data: result,
    });
});
const cancelExtensionRequestByTask = catchAsync(async (req, res) => {
    const result =
        await extensionRequestServices.cancelExtensionRequestByTaskFromDB(
            req.user.profileId,
            req.params.id as string
        );
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Extension request delete  successfully',
        data: result,
    });
});
const acceptRequest = catchAsync(async (req, res) => {
    const result = await extensionRequestServices.acceptRequestFromDB(
        req.user.profileId,
        req.params.id as string
    );
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Accept Request successfully',
        data: result,
    });
});

const rejectRequest = catchAsync(async (req, res) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const file: any = req.files?.reject_evidence;
    if (req.files?.reject_evidence) {
        req.body.reject_evidence = getCloudFrontUrl(file[0].key);
    }
    const result = await extensionRequestServices.rejectRequestFromDB(
        req.user.profileId,
        req.params.id as string,
        req.body
    );

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Reject Request successfully',
        data: result,
    });
});
const makeDisputeForAdmin = catchAsync(async (req, res) => {
    const result = await extensionRequestServices.makeDisputeForAdmin(
        req.user.profileId,
        req.params.id as string
    );

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Dispute made for admin review',
        data: result,
    });
});

const ExtensionRequestController = {
    createExtensionRequest,
    extensionRequestByTask,
    cancelExtensionRequestByTask,
    acceptRequest,
    rejectRequest,
    makeDisputeForAdmin,
};
export default ExtensionRequestController;

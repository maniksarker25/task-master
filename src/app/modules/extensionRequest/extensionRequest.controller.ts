/* eslint-disable @typescript-eslint/no-explicit-any */
import httpStatus from 'http-status';
import { getCloudFrontUrl } from '../../helper/multer-s3-uploader';
import catchAsync from '../../utilities/catchasync';
import sendResponse from '../../utilities/sendResponse';
import { ENUM_EXTENSION_REQUEST_STATUS } from './extensionRequest.enum';
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
const extensionRequestAcceptReject = catchAsync(async (req, res) => {
    const { status } = req.body;

    if (
        status === ENUM_EXTENSION_REQUEST_STATUS.REJECTED &&
        req.files?.reject_evidence
    ) {
        const file: any = req.files.reject_evidence;
        req.body.reject_evidence = getCloudFrontUrl(file[0].key);
    }

    const result = await extensionRequestServices.extensionRequestAcceptReject(
        req.user.profileId,
        req.params.id as string,
        req.body
    );

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message:
            status === ENUM_EXTENSION_REQUEST_STATUS.APPROVED
                ? 'Extension request approved successfully'
                : 'Extension request rejected successfully',
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
    extensionRequestAcceptReject,
    makeDisputeForAdmin,
};
export default ExtensionRequestController;

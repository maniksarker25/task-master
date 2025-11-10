import httpStatus from 'http-status';
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
    const result = await extensionRequestServices.getExtensionRequestByTask(
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

const ExtensionRequestController = {
    createExtensionRequest,
    extensionRequestByTask,
};
export default ExtensionRequestController;

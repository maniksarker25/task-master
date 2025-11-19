/* eslint-disable @typescript-eslint/no-explicit-any */
import httpStatus from 'http-status';
import AppError from '../../error/appError';
import { ENUM_TASK_STATUS } from '../task/task.enum';
import TaskModel from '../task/task.model';
import { ENUM_EXTENSION_REQUEST_STATUS } from './extensionRequest.enum';
import { IExtensionRequest } from './extensionRequest.interface';
import extensionRequestModel from './extensionRequest.model';

const extensionRequestIntoDb = async (
    profileId: string,
    payload: Partial<IExtensionRequest>
) => {
    let currentUserRole;
    let requestToUserRole;
    let requestTo: any;
    const task = await TaskModel.findOne({
        $or: [{ provider: profileId }, { customer: profileId }],
        _id: payload.task,
    });
    if (!task) {
        throw new AppError(httpStatus.NOT_FOUND, 'Task not found');
    }

    if (profileId == task.provider?.toString()) {
        currentUserRole = 'Provider';
        requestToUserRole = 'Customer';
        requestTo = task.customer;
    } else if (profileId == task.customer?.toString()) {
        currentUserRole = 'Customer';
        requestToUserRole = 'Provider';
        requestTo = task.provider;
    }

    if (task.status !== ENUM_TASK_STATUS.IN_PROGRESS) {
        throw new AppError(
            httpStatus.BAD_REQUEST,
            'Extension request can only be made for in-progress tasks'
        );
    }

    const extensionRequestData = {
        task: payload.task,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        requestFrom: profileId as any,
        requestTo: requestTo,
        requestedFromModel: currentUserRole,
        requestToModel: requestToUserRole,
        currentDate: task.preferredDate,
        requestedDateTime: payload.requestedDateTime,
        reason: payload.reason,
    };
    const result = await extensionRequestModel.create(extensionRequestData);
    return result;
};

const getExtensionRequestByTaskFromDB = async (
    profileId: string,
    taskId: string
) => {
    const task = await TaskModel.findById(taskId);
    if (!task) {
        throw new AppError(httpStatus.NOT_FOUND, 'Task not found');
    }
    const isAuthorized =
        task.provider?.toString() === profileId ||
        task.customer?.toString() === profileId;
    if (!isAuthorized) {
        throw new AppError(
            httpStatus.UNAUTHORIZED,
            'You are not authorized to view this request'
        );
    }

    const result = await extensionRequestModel
        .find({ task: taskId })
        .populate('requestTo', 'name profile_image')
        .populate({ path: 'requestFrom', select: 'name profile_image' });

    return result;
};
const cancelExtensionRequestByTaskFromDB = async (
    profileId: string,
    extensionID: string
) => {
    const extensionRequest = await extensionRequestModel.findById(extensionID);
    if (!extensionRequest) {
        throw new AppError(httpStatus.NOT_FOUND, 'Extension Request not found');
    }

    if (extensionRequest.requestFrom.toString() !== profileId) {
        throw new AppError(
            httpStatus.UNAUTHORIZED,
            'You are not authorized to cancel this request'
        );
    }

    const result = await extensionRequestModel.findByIdAndDelete(extensionID);

    if (!result) {
        throw new AppError(
            httpStatus.NOT_FOUND,
            'No extension request found for this task'
        );
    }
    return result;
};
const acceptRequestFromDB = async (profileId: string, extensionID: string) => {
    const extensionRequest = await extensionRequestModel.findById(extensionID);
    if (!extensionRequest) {
        throw new AppError(httpStatus.NOT_FOUND, 'Extension Request not found');
    }

    const task = await TaskModel.findById(extensionRequest.task);

    const isAuthorized =
        task?.provider?.toString() === profileId ||
        task?.customer?.toString() === profileId;
    if (!isAuthorized) {
        throw new AppError(
            httpStatus.UNAUTHORIZED,
            'You are not authorized to view this request'
        );
    }

    const result = await extensionRequestModel.findByIdAndUpdate(
        extensionID,
        {
            status: ENUM_EXTENSION_REQUEST_STATUS.APPROVED,
        },
        { new: true, runValidators: true }
    );

    if (!result) {
        throw new AppError(
            httpStatus.NOT_FOUND,
            'No extension request found for this task'
        );
    }
    return result;
};
const rejectRequestFromDB = async (
    profileId: string,
    extensionID: string,
    payload: Partial<IExtensionRequest>
) => {
    // 1️⃣ Find the extension request
    const extensionRequest = await extensionRequestModel.findById(extensionID);
    if (!extensionRequest) {
        throw new AppError(httpStatus.NOT_FOUND, 'Extension Request not found');
    }

    // 2️⃣ Find the related task
    const task = await TaskModel.findById(extensionRequest.task);
    if (!task) {
        throw new AppError(httpStatus.NOT_FOUND, 'Task not found');
    }

    // 3️⃣ Check authorization (must be provider or customer of the task)
    const isAuthorized =
        task.provider?.toString() === profileId ||
        task.customer?.toString() === profileId;

    if (!isAuthorized) {
        throw new AppError(
            httpStatus.UNAUTHORIZED,
            'You are not authorized to reject this request'
        );
    }

    // 4️⃣ Prepare update data safely
    const updateData: Partial<IExtensionRequest> = {
        status: ENUM_EXTENSION_REQUEST_STATUS.REJECTED,
        rejectDetails: payload.rejectDetails,
        reject_evidence: payload.reject_evidence,
    };

    // 5️⃣ Update the document
    const result = await extensionRequestModel.findByIdAndUpdate(
        extensionID,
        { $set: updateData },
        { new: true, runValidators: true }
    );

    if (!result) {
        throw new AppError(httpStatus.NOT_FOUND, 'Failed to update rejection');
    }

    return result;
};
const ExtensionRequestServices = {
    extensionRequestIntoDb,
    getExtensionRequestByTaskFromDB,
    cancelExtensionRequestByTaskFromDB,
    acceptRequestFromDB,
    rejectRequestFromDB,
};
export default ExtensionRequestServices;

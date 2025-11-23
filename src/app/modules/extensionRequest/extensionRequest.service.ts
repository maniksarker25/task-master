/* eslint-disable @typescript-eslint/no-explicit-any */
import httpStatus from 'http-status';
import mongoose from 'mongoose';
import AppError from '../../error/appError';
import { ENUM_TASK_STATUS } from '../task/task.enum';
import TaskModel from '../task/task.model';
import { ENUM_EXTENSION_REQUEST_STATUS } from './extensionRequest.enum';
import { IExtensionRequest } from './extensionRequest.interface';
import extensionRequestModel from './extensionRequest.model';
import Notification from '../notification/notification.model';
import { ENUM_NOTIFICATION_TYPE } from '../notification/notification.enum';
import { sendSinglePushNotification } from '../../helper/sendPushNotification';
import { User } from '../user/user.model';

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
        currentDate: task.preferredDeliveryDateTime,
        requestedDateTime: payload.requestedDateTime,
        reason: payload.reason,
    };
    const result = await extensionRequestModel.create(extensionRequestData);

    // ============================================
    // 🔥 SEND NOTIFICATION TO requestTo USER
    // ============================================

    const title = 'Extension Request';
    const message = `${currentUserRole} requested more time for the task "${task.title}"`;

    // Save notification
    await Notification.create({
        title,
        message,
        receiver: requestTo.toString(), // 👈 Send to the target user
        type: ENUM_NOTIFICATION_TYPE.EXTENSION_REQUEST,
        redirectLink: `/task/${task._id}`,
    });

    // Send push notification
    const receiverUser = await User.findOne({ profileId: requestTo });

    if (receiverUser) {
        await sendSinglePushNotification(
            receiverUser._id.toString(),
            title,
            message,
            {
                taskId: task._id.toString(),
                type: ENUM_NOTIFICATION_TYPE.EXTENSION_REQUEST,
            }
        );
    }

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
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const extensionRequest = await extensionRequestModel
            .findById(extensionID)
            .session(session);

        if (!extensionRequest) {
            throw new AppError(
                httpStatus.NOT_FOUND,
                'Extension Request not found'
            );
        }

        const task = await TaskModel.findById(extensionRequest.task).session(
            session
        );

        const isAuthorized =
            task?.provider?.toString() === profileId ||
            task?.customer?.toString() === profileId;

        if (!isAuthorized) {
            throw new AppError(
                httpStatus.UNAUTHORIZED,
                'You are not authorized to view this request'
            );
        }

        const updatedExtension = await extensionRequestModel.findByIdAndUpdate(
            extensionID,
            {
                status: ENUM_EXTENSION_REQUEST_STATUS.APPROVED,
            },
            { new: true, runValidators: true, session }
        );

        if (!updatedExtension) {
            throw new AppError(
                httpStatus.NOT_FOUND,
                'No extension request found for this task'
            );
        }

        await TaskModel.findByIdAndUpdate(
            extensionRequest.task,
            {
                preferredDeliveryDateTime: extensionRequest.requestedDateTime,
            },
            { session }
        );

        await session.commitTransaction();
        session.endSession();

        return updatedExtension;
    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        throw error;
    }
};

const rejectRequestFromDB = async (
    profileId: string,
    extensionID: string,
    payload: Partial<IExtensionRequest>
) => {
    const extensionRequest: any = await extensionRequestModel
        .findById(extensionID)
        .populate({
            path: 'task',
            select: 'provider customer',
        });

    if (!extensionRequest) {
        throw new AppError(httpStatus.NOT_FOUND, 'Extension Request not found');
    }

    if (!extensionRequest.task) {
        throw new AppError(httpStatus.NOT_FOUND, 'Task not found');
    }

    const isAuthorized =
        extensionRequest.task.provider?.toString() === profileId ||
        extensionRequest.task.customer?.toString() === profileId;

    if (!isAuthorized) {
        throw new AppError(
            httpStatus.UNAUTHORIZED,
            'You are not authorized to reject this request'
        );
    }

    const updateData: Partial<IExtensionRequest> = {
        status: ENUM_EXTENSION_REQUEST_STATUS.REJECTED,
        rejectDetails: payload.rejectDetails,
        reject_evidence: payload.reject_evidence,
    };

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

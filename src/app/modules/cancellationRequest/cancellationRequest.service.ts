/* eslint-disable @typescript-eslint/no-explicit-any */
import httpStatus from 'http-status';
import mongoose from 'mongoose';
import AppError from '../../error/appError';
import { ENUM_TASK_STATUS } from '../task/task.enum';
import TaskModel from '../task/task.model';
import { ENUM_CANCELLATION_REQUEST_STATUS } from './cancellationRequest.enum';
import { ICancellationRequest } from './cancellationRequest.interface';
import CancellationRequestModel from './cancellationRequest.model';

const createCancellationRequestIntoDb = async (
    profileId: string,
    payload: Partial<ICancellationRequest>
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
    const result = await CancellationRequestModel.create(extensionRequestData);
    return result;
};

const getCancellationRequestByTaskFromDB = async (
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

    const result = await CancellationRequestModel.findOne({
        task: taskId,
    }).populate('requestFrom', 'name profile_image');

    if (!result) {
        throw new AppError(
            httpStatus.NOT_FOUND,
            'No cancellation request found for this task'
        );
    }
    return result;
};

const cancelCancellationRequestByTaskFromDB = async (
    profileId: string,
    cancellationId: string
) => {
    const cancellationRequest =
        await CancellationRequestModel.findById(cancellationId);
    if (!cancellationRequest) {
        throw new AppError(
            httpStatus.NOT_FOUND,
            'Cancellation Request not found'
        );
    }

    if (cancellationRequest.requestFrom.toString() !== profileId) {
        throw new AppError(
            httpStatus.UNAUTHORIZED,
            'You are not authorized to cancel this request'
        );
    }

    const result =
        await CancellationRequestModel.findByIdAndDelete(cancellationId);

    if (!result) {
        throw new AppError(
            httpStatus.NOT_FOUND,
            'No cancellation request found'
        );
    }
    return result;
};

const acceptRejectCancellationRequest = async (
    profileId: string,
    cancellationId: string,
    payload: Partial<ICancellationRequest>
) => {
    const session = await mongoose.startSession();

    try {
        session.startTransaction();

        // 1. Find cancellation request
        const cancellationRequest =
            await CancellationRequestModel.findById(cancellationId).session(
                session
            );

        if (!cancellationRequest) {
            throw new AppError(
                httpStatus.NOT_FOUND,
                'Cancellation Request not found'
            );
        }

        // 2. Find task
        const task = await TaskModel.findById(cancellationRequest.task).session(
            session
        );
        if (!task) {
            throw new AppError(httpStatus.NOT_FOUND, 'Task not found');
        }

        // 3. Authorization check
        const isAuthorized =
            task.provider?.toString() === profileId ||
            task.customer?.toString() === profileId;

        if (!isAuthorized) {
            throw new AppError(
                httpStatus.UNAUTHORIZED,
                'You are not authorized'
            );
        }

        let updatedCancellation: any = null;
        let updatedTask: any = null;

        // -------------------------
        // ACCEPT LOGIC
        // -------------------------
        if (payload.status === ENUM_CANCELLATION_REQUEST_STATUS.ACCEPTED) {
            updatedCancellation =
                await CancellationRequestModel.findByIdAndUpdate(
                    cancellationId,
                    { status: ENUM_CANCELLATION_REQUEST_STATUS.ACCEPTED },
                    { new: true, runValidators: true, session }
                );

            updatedTask = await TaskModel.findByIdAndUpdate(
                task._id,
                {
                    status: ENUM_TASK_STATUS.CANCELLED,
                    $push: {
                        statusWithDate: {
                            status: ENUM_TASK_STATUS.CANCELLED,
                            date: new Date(),
                        },
                    },
                },
                { new: true, runValidators: true, session }
            );
        }

        // -------------------------
        // REJECT LOGIC
        // -------------------------
        else if (payload.status === ENUM_CANCELLATION_REQUEST_STATUS.REJECTED) {
            updatedCancellation =
                await CancellationRequestModel.findByIdAndUpdate(
                    cancellationId,
                    {
                        status: ENUM_CANCELLATION_REQUEST_STATUS.REJECTED,
                        rejectDetails: payload?.rejectDetails,
                        reject_evidence: payload?.reject_evidence,
                    },
                    { new: true, runValidators: true, session }
                );
        }

        // Commit transaction only in ACCEPT case (because it updates task also)
        await session.commitTransaction();
        return { cancellationRequest: updatedCancellation, task: updatedTask };
    } catch (error) {
        await session.abortTransaction();
        throw error;
    } finally {
        session.endSession();
    }
};

const makeDisputeForAdmin = async (
    profileId: string,
    cancelRequestId: string
) => {
    const cancelRequest: any = await CancellationRequestModel.findOne({
        _id: cancelRequestId,
        requestTo: profileId,
    });
    if (!cancelRequest) {
        throw new AppError(
            httpStatus.NOT_FOUND,
            'Cancellation Request not found'
        );
    }
    const result = await CancellationRequestModel.findByIdAndUpdate(
        cancelRequestId,
        { status: ENUM_CANCELLATION_REQUEST_STATUS.DISPUTED },
        { new: true, runValidators: true }
    );
    return result;
};
const CancellationRequestServices = {
    createCancellationRequestIntoDb,
    getCancellationRequestByTaskFromDB,
    cancelCancellationRequestByTaskFromDB,
    acceptRejectCancellationRequest,
    makeDisputeForAdmin,
};

export default CancellationRequestServices;

import httpStatus from 'http-status';
import AppError from '../../error/appError';
import { ICancellationRequest } from './cancellationRequest.interface';
import cancellationRequestModel from './cancellationRequest.model';
import TaskModel from '../task/task.model';
import { ENUM_CANCELLATION_REQUEST_STATUS } from './cancellationRequest.enum';
import { ENUM_TASK_STATUS } from '../task/task.enum';

const createCancellationRequestIntoDb = async (
    profileId: string,
    payload: Partial<ICancellationRequest>
) => {
    let currentUserRole: 'Customer' | 'Provider' | '' = '';
    const task = await TaskModel.findById(payload.task);
    if (!task) {
        throw new AppError(httpStatus.NOT_FOUND, 'Task not found');
    }

    if (profileId == task.provider?.toString()) {
        currentUserRole = 'Provider';
    } else if (profileId == task.customer?.toString()) {
        currentUserRole = 'Customer';
    }

    if (currentUserRole === '') {
        throw new AppError(
            httpStatus.UNAUTHORIZED,
            'You are not authorized to cancel request for this task'
        );
    }

    if (task.status !== ENUM_TASK_STATUS.IN_PROGRESS) {
        throw new AppError(
            httpStatus.BAD_REQUEST,
            'Cancel request can only be made for in-progress tasks'
        );
    }

    const cancelRequestData: Partial<ICancellationRequest> = {
        task: payload.task,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        requestedBy: profileId as any,
        requestedByModel: currentUserRole,
        reason: payload.reason,
        description: payload.description,
        evidence: payload.reject_evidence,
    };

    const result = (
        await cancellationRequestModel.create(cancelRequestData)
    ).populate('requestedBy');
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

    const result = await cancellationRequestModel
        .findOne({ task: taskId })
        .populate('requestedBy')
        .populate('task');

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
        await cancellationRequestModel.findById(cancellationId);
    if (!cancellationRequest) {
        throw new AppError(
            httpStatus.NOT_FOUND,
            'Cancellation Request not found'
        );
    }

    if (cancellationRequest.requestedBy.toString() !== profileId) {
        throw new AppError(
            httpStatus.UNAUTHORIZED,
            'You are not authorized to cancel this request'
        );
    }

    const result =
        await cancellationRequestModel.findByIdAndDelete(cancellationId);

    if (!result) {
        throw new AppError(
            httpStatus.NOT_FOUND,
            'No cancellation request found'
        );
    }
    return result;
};

const acceptCancellationRequestFromDB = async (
    profileId: string,
    cancellationId: string
) => {
    const cancellationRequest =
        await cancellationRequestModel.findById(cancellationId);
    if (!cancellationRequest) {
        throw new AppError(
            httpStatus.NOT_FOUND,
            'Cancellation Request not found'
        );
    }

    const task = await TaskModel.findById(cancellationRequest.task);

    const isAuthorized =
        task?.provider?.toString() === profileId ||
        task?.customer?.toString() === profileId;

    if (!isAuthorized) {
        throw new AppError(
            httpStatus.UNAUTHORIZED,
            'You are not authorized to process this request'
        );
    }

    const result = await cancellationRequestModel.findByIdAndUpdate(
        cancellationId,
        {
            status: ENUM_CANCELLATION_REQUEST_STATUS.APPROVED,
        },
        { new: true, runValidators: true }
    );

    if (!result) {
        throw new AppError(
            httpStatus.NOT_FOUND,
            'No cancellation request found'
        );
    }
    return result;
};

const rejectCancellationRequestFromDB = async (
    profileId: string,
    cancellationId: string,
    payload: Partial<ICancellationRequest>
) => {
    // 1️⃣ Find the cancellation request
    const cancellationRequest =
        await cancellationRequestModel.findById(cancellationId);
    if (!cancellationRequest) {
        throw new AppError(
            httpStatus.NOT_FOUND,
            'Cancellation Request not found'
        );
    }

    // 2️⃣ Find the related task
    const task = await TaskModel.findById(cancellationRequest.task);
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
    const updateData: Partial<ICancellationRequest> = {
        status: ENUM_CANCELLATION_REQUEST_STATUS.REJECTED,
        rejectDetails: payload.rejectDetails,
        reject_evidence: payload.reject_evidence,
    };

    // 5️⃣ Update the document
    const result = await cancellationRequestModel.findByIdAndUpdate(
        cancellationId,
        { $set: updateData },
        { new: true, runValidators: true }
    );

    if (!result) {
        throw new AppError(httpStatus.NOT_FOUND, 'Failed to update rejection');
    }

    return result;
};

const CancellationRequestServices = {
    createCancellationRequestIntoDb,
    getCancellationRequestByTaskFromDB,
    cancelCancellationRequestByTaskFromDB,
    acceptCancellationRequestFromDB,
    rejectCancellationRequestFromDB,
};

export default CancellationRequestServices;

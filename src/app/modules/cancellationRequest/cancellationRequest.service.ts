/* eslint-disable @typescript-eslint/no-explicit-any */
import axios from 'axios';
import httpStatus from 'http-status';
import mongoose from 'mongoose';
import config from '../../config';
import { payStackBaseUrl, platformChargePercentage } from '../../constant';
import AppError from '../../error/appError';
import { ENUM_PAYMENT_STATUS } from '../../utilities/enum';
import Payment from '../payment/payment.model';
import { ENUM_REFERRAL_USE_STATUS } from '../referralUse/referralUse.enum';
import ReferralUseModel from '../referralUse/referralUse.model';
import { ENUM_TASK_STATUS } from '../task/task.enum';
import TaskModel from '../task/task.model';
import { ENUM_CANCELLATION_REQUEST_STATUS } from './cancellationRequest.enum';
import { ICancellationRequest } from './cancellationRequest.interface';
import CancellationRequestModel from './cancellationRequest.model';

const createCancellationRequestIntoDb = async (
    profileId: string,
    payload: Partial<ICancellationRequest>
) => {
    const requestExists = await CancellationRequestModel.findOne({
        requestFrom: profileId,
        $or: [
            { status: ENUM_CANCELLATION_REQUEST_STATUS.PENDING },
            { status: ENUM_CANCELLATION_REQUEST_STATUS.DISPUTED },
        ],
    });
    if (!requestExists) {
        throw new AppError(
            httpStatus.BAD_REQUEST,
            'You have already submitted an cancellation request that has not been resolved yet. Once it is resolved, you can submit another request.'
        );
    }
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

        const task = await TaskModel.findById(cancellationRequest.task).session(
            session
        );
        if (!task) {
            throw new AppError(httpStatus.NOT_FOUND, 'Task not found');
        }

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
                    paymentStatus: ENUM_PAYMENT_STATUS.REFUNDED,
                    $push: {
                        statusWithDate: {
                            status: ENUM_TASK_STATUS.CANCELLED,
                            date: new Date(),
                        },
                    },
                },
                { new: true, runValidators: true, session }
            );
            const platformCharge =
                task.customerPayingAmount * platformChargePercentage;
            const refundableAmount = task.customerPayingAmount - platformCharge;
            const response = await axios.post(
                `${payStackBaseUrl}/refund`,
                {
                    transaction: task.transactionId,
                    amount: refundableAmount * 100,
                },
                {
                    headers: {
                        Authorization: `Bearer ${config.payStack.secretKey}`,
                        'Content-Type': 'application/json',
                    },
                }
            );
            console.log('Refund Response:', response.data);
            return { updatedTask: updatedTask, refundResponse: response.data };
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

const resolveByAdmin = async (cancelRequestId: string, payload: any) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        if (
            payload.status === ENUM_CANCELLATION_REQUEST_STATUS.ACCEPTED &&
            !payload.payTo
        ) {
            throw new AppError(
                httpStatus.BAD_REQUEST,
                'payTo is required when accepting the cancellation request'
            );
        }

        const cancelRequest =
            await CancellationRequestModel.findById(cancelRequestId).session(
                session
            );

        if (!cancelRequest) {
            throw new AppError(
                httpStatus.NOT_FOUND,
                'Cancellation Request not found'
            );
        }

        if (payload.status === ENUM_CANCELLATION_REQUEST_STATUS.REJECTED) {
            const result = await CancellationRequestModel.findByIdAndUpdate(
                cancelRequestId,
                { status: ENUM_CANCELLATION_REQUEST_STATUS.RESOLVED },
                { new: true, runValidators: true, session }
            );

            await session.commitTransaction();
            return result;
        }

        if (payload.status === ENUM_CANCELLATION_REQUEST_STATUS.ACCEPTED) {
            const task = await TaskModel.findById(cancelRequest.task).session(
                session
            );

            if (!task) {
                throw new AppError(httpStatus.NOT_FOUND, 'Task not found');
            }

            await CancellationRequestModel.findByIdAndUpdate(
                cancelRequestId,
                { status: ENUM_CANCELLATION_REQUEST_STATUS.RESOLVED },
                { new: true, runValidators: true, session }
            );

            const updatedTask = await TaskModel.findByIdAndUpdate(
                task._id,
                {
                    status: ENUM_TASK_STATUS.CANCELLED,
                    paymentStatus: ENUM_PAYMENT_STATUS.REFUNDED,
                },
                { new: true, runValidators: true, session }
            );

            if (payload.payTo === 'Customer') {
                const platformCharge =
                    task.customerPayingAmount * platformChargePercentage;
                const refundableAmount =
                    task.customerPayingAmount - platformCharge;

                const response = await axios.post(
                    `${payStackBaseUrl}/refund`,
                    {
                        transaction: task.transactionId,
                        amount: refundableAmount * 100,
                    },
                    {
                        headers: {
                            Authorization: `Bearer ${config.payStack.secretKey}`,
                            'Content-Type': 'application/json',
                        },
                    }
                );

                await session.commitTransaction();
                return { updatedTask, refundResponse: response.data };
            }

            if (payload.payTo === 'Provider') {
                const referralUse = await ReferralUseModel.findOneAndUpdate(
                    {
                        referred: task.provider,
                        status: ENUM_REFERRAL_USE_STATUS.ACTIVE,
                    },
                    { status: ENUM_REFERRAL_USE_STATUS.USED },
                    {
                        new: true,
                        sort: { createdAt: 1 },
                        runValidators: true,
                        session,
                    }
                );

                const amount = referralUse
                    ? (task.acceptedBidAmount ?? 0) + referralUse.value
                    : task.acceptedBidAmount ?? 0;

                await Payment.create(
                    [
                        {
                            provider: task.provider,
                            task: task._id,
                            amount,
                        },
                    ],
                    { session }
                );

                await session.commitTransaction();
                return { updatedTask, message: 'Provider payment processed' };
            }
        }

        throw new AppError(
            httpStatus.BAD_REQUEST,
            'Invalid status for resolution'
        );
    } catch (error) {
        await session.abortTransaction();
        throw error;
    } finally {
        session.endSession();
    }
};

const CancellationRequestServices = {
    createCancellationRequestIntoDb,
    getCancellationRequestByTaskFromDB,
    cancelCancellationRequestByTaskFromDB,
    acceptRejectCancellationRequest,
    makeDisputeForAdmin,
    resolveByAdmin,
};

export default CancellationRequestServices;

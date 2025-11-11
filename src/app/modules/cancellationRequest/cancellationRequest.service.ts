import httpStatus from 'http-status';
import AppError from '../../error/appError';
import { ICancellationRequest } from './cancellationRequest.interface';
import cancellationRequestModel from './cancellationRequest.model';
import TaskModel from '../task/task.model';

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
    const cancelRequestData: Partial<ICancellationRequest> = {
        task: payload.task,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        requestedBy: profileId as any,
        requestedByModel: currentUserRole,
        reason: payload.reason,
    };
    const result = (
        await cancellationRequestModel.create(cancelRequestData)
    ).populate('requestedBy');
    return result;
};

const CancellationRequestServices = { createCancellationRequestIntoDb };
export default CancellationRequestServices;
